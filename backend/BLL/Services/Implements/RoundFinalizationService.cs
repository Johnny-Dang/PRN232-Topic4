using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Utilities;
using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class RoundFinalizationService : IRoundFinalizationService
    {
        private static readonly ConcurrentDictionary<Guid, SemaphoreSlim> RoundLocks = new();

        private readonly ApplicationDbContext _dbContext;
        private readonly IRankingService _rankingService;
        private readonly INotificationSender _notificationSender;
        private readonly ILogger<RoundFinalizationService> _logger;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Events> _eventRepository;
        private readonly IGenericRepository<Rankings> _rankingRepository;
        private readonly IGenericRepository<AdvancementRules> _ruleRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<TeamMembers> _teamMemberRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<Notifications> _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RoundFinalizationService(
            ApplicationDbContext dbContext,
            IUnitOfWork unitOfWork,
            IRankingService rankingService,
            INotificationSender notificationSender,
            ILogger<RoundFinalizationService> logger)
        {
            _dbContext = dbContext;
            _unitOfWork = unitOfWork;
            _rankingService = rankingService;
            _notificationSender = notificationSender;
            _logger = logger;
            _roundRepository = unitOfWork.GetRepository<Rounds>();
            _eventRepository = unitOfWork.GetRepository<Events>();
            _rankingRepository = unitOfWork.GetRepository<Rankings>();
            _ruleRepository = unitOfWork.GetRepository<AdvancementRules>();
            _teamRepository = unitOfWork.GetRepository<Teams>();
            _teamMemberRepository = unitOfWork.GetRepository<TeamMembers>();
            _userRepository = unitOfWork.GetRepository<Users>();
            _notificationRepository = unitOfWork.GetRepository<Notifications>();
        }

        public async Task<int> FinalizeDueRoundsAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            var dueRounds = (await _roundRepository.FindAsync(
                    round => !round.IsFinalized,
                    cancellationToken))
                .Where(round => RoundTimePolicy.HasEnded(round.EndDate, now))
                .Select(round => round.RoundId)
                .ToList();
            var finalizedCount = 0;

            foreach (var roundId in dueRounds)
            {
                try
                {
                    var result = await FinalizeRoundAsync(roundId, cancellationToken);
                    if (result.IsFinalized)
                        finalizedCount++;
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception exception)
                {
                    _logger.LogError(
                        exception,
                        "Không thể tự động chốt round {RoundId}; worker sẽ thử lại ở chu kỳ sau.",
                        roundId);
                }
            }

            return finalizedCount;
        }

        public async Task<RoundFinalizationDto> FinalizeRoundAsync(
            Guid roundId,
            CancellationToken cancellationToken = default)
        {
            var gate = RoundLocks.GetOrAdd(roundId, _ => new SemaphoreSlim(1, 1));
            await gate.WaitAsync(cancellationToken);

            try
            {
                // The due-round scan uses the same scoped context. Clear those tracked snapshots
                // so the lock query always observes a finalization committed by another worker.
                _dbContext.ChangeTracker.Clear();
                await using var transaction = await _dbContext.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable,
                    cancellationToken);
                var round = await GetRoundWithUpdateLockAsync(roundId, cancellationToken)
                    ?? throw new Exception($"Không tìm thấy vòng thi với id: {roundId}");
                var eventEntity = await _eventRepository.GetByIdAsync(
                    round.EventId,
                    cancellationToken)
                    ?? throw new Exception($"Không tìm thấy sự kiện với id: {round.EventId}");
                var eventRounds = await _roundRepository.FindAsync(
                    item => item.EventId == round.EventId,
                    cancellationToken);
                var isFinalRound = eventRounds.Any()
                    && round.RoundOrder == eventRounds.Max(item => item.RoundOrder);

                if (round.IsFinalized)
                {
                    if (isFinalRound
                        && !string.Equals(
                            eventEntity.Status,
                            "Completed",
                            StringComparison.OrdinalIgnoreCase))
                    {
                        eventEntity.Status = "Completed";
                        _eventRepository.Update(eventEntity);
                        await _unitOfWork.SaveChangesAsync(cancellationToken);
                    }

                    await transaction.CommitAsync(cancellationToken);
                    return await CreateResultAsync(round, isFinalRound);
                }

                if (!RoundTimePolicy.HasEnded(round.EndDate, DateTime.UtcNow))
                {
                    throw new Exception(
                        $"Vòng {round.RoundName} chưa hết hạn. Chỉ có thể chốt từ "
                        + $"{RoundTimePolicy.GetEffectiveEndAtUtc(round.EndDate):yyyy-MM-dd HH:mm:ss} UTC.");
                }

                var rules = await _ruleRepository.FindAsync(
                    rule => rule.RoundId == roundId,
                    cancellationToken);
                if (!rules.Any())
                    throw new Exception("Round chưa có quy tắc Top N nên chưa thể chốt.");

                var topNByCategory = rules
                    .GroupBy(rule => rule.CategoryId)
                    .ToDictionary(group => group.Key, group => group.Min(rule => rule.TopN));
                var teams = await _teamRepository.FindAsync(
                    team => team.EventId == round.EventId,
                    cancellationToken);
                var missingRuleCategory = teams
                    .Where(team => team.CategoryId.HasValue)
                    .Select(team => team.CategoryId!.Value)
                    .Distinct()
                    .FirstOrDefault(categoryId => !topNByCategory.ContainsKey(categoryId));
                if (missingRuleCategory != Guid.Empty)
                    throw new Exception($"Category {missingRuleCategory} chưa có quy tắc Top N.");

                await _rankingService.GenerateAsync(roundId);
                var rankings = (await _rankingRepository.FindAsync(
                        ranking => ranking.RoundId == roundId,
                        cancellationToken))
                    .ToList();

                RoundFinalizationPolicy.ApplyAdvancement(rankings, topNByCategory);
                foreach (var ranking in rankings)
                {
                    _rankingRepository.Update(ranking);
                }

                var finalizedAt = DateTime.UtcNow;
                round.IsFinalized = true;
                round.FinalizedAt = finalizedAt;
                _roundRepository.Update(round);

                if (isFinalRound)
                {
                    eventEntity.Status = "Completed";
                    _eventRepository.Update(eventEntity);
                }

                var pendingSignals = await AddFinalizationNotificationsAsync(
                    eventEntity,
                    round,
                    teams,
                    rankings,
                    isFinalRound,
                    finalizedAt,
                    cancellationToken);

                await _unitOfWork.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                foreach (var signal in pendingSignals)
                {
                    try
                    {
                        await _notificationSender.SendNotificationToUserAsync(
                            signal.UserId,
                            signal.Message);
                    }
                    catch (Exception exception)
                    {
                        _logger.LogWarning(
                            exception,
                            "Round {RoundId} đã chốt nhưng không gửi được SignalR tới user {UserId}.",
                            roundId,
                            signal.UserId);
                    }
                }

                return await CreateResultAsync(round, isFinalRound);
            }
            finally
            {
                gate.Release();
            }
        }

        private async Task<Rounds?> GetRoundWithUpdateLockAsync(
            Guid roundId,
            CancellationToken cancellationToken)
        {
            if (_dbContext.Database.IsSqlServer())
            {
                return await _dbContext.Rounds
                    .FromSqlInterpolated(
                        $"SELECT * FROM [Rounds] WITH (UPDLOCK, HOLDLOCK) WHERE [RoundId] = {roundId}")
                    .SingleOrDefaultAsync(cancellationToken);
            }

            return await _dbContext.Rounds.SingleOrDefaultAsync(
                round => round.RoundId == roundId,
                cancellationToken);
        }

        private async Task<List<PendingSignal>> AddFinalizationNotificationsAsync(
            Events eventEntity,
            Rounds round,
            IReadOnlyList<Teams> teams,
            IReadOnlyList<Rankings> rankings,
            bool isFinalRound,
            DateTime createdAt,
            CancellationToken cancellationToken)
        {
            var pendingSignals = new List<PendingSignal>();
            var rankingsByTeam = rankings
                .GroupBy(ranking => ranking.TeamId)
                .ToDictionary(group => group.Key, group => group.OrderBy(item => item.RankPosition).First());
            var teamIds = teams.Select(team => team.TeamId).ToList();
            var memberships = await _teamMemberRepository.FindAsync(
                member => teamIds.Contains(member.TeamId),
                cancellationToken);

            foreach (var team in teams)
            {
                rankingsByTeam.TryGetValue(team.TeamId, out var ranking);
                var message = CreateTeamNotificationMessage(
                    eventEntity,
                    round,
                    team,
                    ranking,
                    isFinalRound);
                var recipientIds = memberships
                    .Where(member => member.TeamId == team.TeamId)
                    .Select(member => member.UserId)
                    .Append(team.TeamLeaderId)
                    .Distinct();

                foreach (var userId in recipientIds)
                    await AddNotificationAsync(userId, message, createdAt, pendingSignals, cancellationToken);
            }

            var coordinators = await _userRepository.FindAsync(
                user => user.Role == "Coordinator" || user.Role == "EventCoordinator",
                cancellationToken);
            var advancedTeams = rankings
                .Where(ranking => ranking.IsAdvanced == true)
                .OrderBy(ranking => ranking.CategoryId)
                .ThenBy(ranking => ranking.RankPosition)
                .Select(ranking =>
                {
                    var teamName = teams.FirstOrDefault(team => team.TeamId == ranking.TeamId)?.TeamName
                        ?? ranking.TeamId.ToString();
                    return $"Top {ranking.RankPosition}: {teamName} "
                        + $"({ranking.TotalScore:0.##} điểm)";
                })
                .ToList();
            var summary = isFinalRound
                ? advancedTeams.Count == 0
                    ? $"Sự kiện {eventEntity.EventName} đã hoàn tất. Vòng {round.RoundName} "
                        + "không có đội nào đạt giải."
                    : $"Sự kiện {eventEntity.EventName} đã hoàn tất. Kết quả vòng "
                        + $"{round.RoundName}, các đội đạt giải: "
                        + $"{string.Join(", ", advancedTeams)}."
                : advancedTeams.Count == 0
                    ? $"Vòng {round.RoundName} đã chốt. Không có đội nào được thăng hạng."
                    : $"Vòng {round.RoundName} đã chốt. Các đội thăng hạng: "
                        + $"{string.Join(", ", advancedTeams)}.";

            foreach (var coordinatorId in coordinators.Select(user => user.UserId).Distinct())
                await AddNotificationAsync(coordinatorId, summary, createdAt, pendingSignals, cancellationToken);

            return pendingSignals;
        }

        private static string CreateTeamNotificationMessage(
            Events eventEntity,
            Rounds round,
            Teams team,
            Rankings? ranking,
            bool isFinalRound)
        {
            if (!isFinalRound)
            {
                return ranking == null
                    ? $"Vòng {round.RoundName} đã chốt. Đội {team.TeamName} không có điểm, "
                        + "không được xếp hạng và bị loại."
                    : $"Vòng {round.RoundName} đã chốt. Đội {team.TeamName}: "
                        + $"điểm {ranking.TotalScore:0.##}, hạng {ranking.RankPosition}, "
                        + $"kết quả: {(ranking.IsAdvanced == true ? "Thăng vòng" : "Bị loại")}.";
            }

            var prefix = $"Sự kiện {eventEntity.EventName} đã hoàn tất. "
                + $"Vòng {round.RoundName}, đội {team.TeamName}: ";
            if (ranking == null)
                return prefix + "không có điểm, không được xếp hạng và không đạt giải.";

            var result = ranking.IsAdvanced == true
                ? $"Đạt giải Top {ranking.RankPosition}"
                : "Không đạt giải";
            return prefix
                + $"điểm {ranking.TotalScore:0.##}, hạng {ranking.RankPosition}, "
                + $"kết quả: {result}.";
        }

        private async Task AddNotificationAsync(
            Guid userId,
            string message,
            DateTime createdAt,
            ICollection<PendingSignal> pendingSignals,
            CancellationToken cancellationToken)
        {
            await _notificationRepository.AddAsync(new Notifications
            {
                NotificationId = Guid.NewGuid(),
                UserId = userId,
                Message = message,
                IsRead = false,
                CreatedAt = createdAt
            }, cancellationToken);
            pendingSignals.Add(new PendingSignal(userId, message));
        }

        private async Task<RoundFinalizationDto> CreateResultAsync(
            Rounds round,
            bool isFinalRound)
        {
            return new RoundFinalizationDto
            {
                RoundId = round.RoundId,
                IsFinalized = round.IsFinalized,
                IsFinalRound = isFinalRound,
                FinalizedAt = round.FinalizedAt,
                Rankings = (await _rankingService.GetByRoundAsync(round.RoundId)).ToList()
            };
        }

        private sealed record PendingSignal(Guid UserId, string Message);
    }
}
