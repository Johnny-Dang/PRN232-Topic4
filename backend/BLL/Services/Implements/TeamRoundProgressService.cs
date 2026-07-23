using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Utilities;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class TeamRoundProgressService : ITeamRoundProgressService
    {
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<TeamMembers> _teamMemberRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Rankings> _rankingRepository;
        private readonly IRoundEligibilityService _roundEligibilityService;

        public TeamRoundProgressService(
            IUnitOfWork unitOfWork,
            IRoundEligibilityService roundEligibilityService)
        {
            _teamRepository = unitOfWork.GetRepository<Teams>();
            _teamMemberRepository = unitOfWork.GetRepository<TeamMembers>();
            _userRepository = unitOfWork.GetRepository<Users>();
            _roundRepository = unitOfWork.GetRepository<Rounds>();
            _rankingRepository = unitOfWork.GetRepository<Rankings>();
            _roundEligibilityService = roundEligibilityService;
        }

        public async Task<IReadOnlyList<TeamRoundProgressDto>> GetAsync(
            Guid teamId,
            Guid requesterUserId,
            CancellationToken cancellationToken = default)
        {
            var team = await _teamRepository.GetByIdAsync(teamId, cancellationToken)
                ?? throw new Exception($"Không tìm thấy đội với id: {teamId}");
            var requester = await _userRepository.GetByIdAsync(requesterUserId, cancellationToken)
                ?? throw new UnauthorizedAccessException("Không tìm thấy người dùng hiện tại.");

            var isCoordinator = string.Equals(requester.Role, "Coordinator", StringComparison.OrdinalIgnoreCase)
                || string.Equals(requester.Role, "EventCoordinator", StringComparison.OrdinalIgnoreCase);
            var isMember = team.TeamLeaderId == requesterUserId
                || await _teamMemberRepository.FirstOrDefaultAsync(
                    member => member.TeamId == teamId && member.UserId == requesterUserId,
                    cancellationToken) != null;

            if (!isCoordinator && !isMember)
                throw new UnauthorizedAccessException("Bạn không có quyền xem tiến độ vòng thi của đội này.");

            if (!team.EventId.HasValue)
                return Array.Empty<TeamRoundProgressDto>();

            var rounds = (await _roundRepository.FindAsync(
                    round => round.EventId == team.EventId.Value,
                    cancellationToken))
                .OrderBy(round => round.RoundOrder)
                .ToList();
            var rankings = await _rankingRepository.FindAsync(
                ranking => ranking.TeamId == teamId,
                cancellationToken);
            var rankingByRound = rankings
                .GroupBy(ranking => ranking.RoundId)
                .ToDictionary(group => group.Key, group => group.OrderBy(item => item.RankPosition).First());
            var now = DateTime.UtcNow;
            var result = new List<TeamRoundProgressDto>();
            var finalRoundOrder = rounds.Any()
                ? rounds.Max(round => round.RoundOrder)
                : (int?)null;

            foreach (var round in rounds)
            {
                var isFinalRound = finalRoundOrder.HasValue
                    && round.RoundOrder == finalRoundOrder.Value;
                rankingByRound.TryGetValue(round.RoundId, out var ranking);
                var effectiveEndAtUtc = RoundTimePolicy.GetEffectiveEndAtUtc(round.EndDate);
                var normalizedStart = RoundTimePolicy.NormalizeUtc(round.StartDate);
                var normalizedDeadline = RoundTimePolicy.NormalizeUtc(round.SubmissionDeadline);
                var status = GetStatus(
                    round,
                    ranking,
                    isFinalRound,
                    now,
                    normalizedStart,
                    effectiveEndAtUtc);
                var (eligible, eligibilityReason) =
                    await _roundEligibilityService.CheckTeamCanParticipateAsync(
                        teamId,
                        round,
                        cancellationToken);

                var canSubmit = eligible
                    && now >= normalizedStart
                    && now <= normalizedDeadline
                    && now < effectiveEndAtUtc
                    && !round.IsFinalized;
                var blockedReason = canSubmit
                    ? null
                    : eligibilityReason
                        ?? GetTimeBlockedReason(now, normalizedStart, normalizedDeadline, effectiveEndAtUtc, round);

                result.Add(new TeamRoundProgressDto
                {
                    RoundId = round.RoundId,
                    RoundName = round.RoundName,
                    RoundOrder = round.RoundOrder,
                    StartDate = round.StartDate,
                    EffectiveEndAtUtc = effectiveEndAtUtc,
                    IsFinalized = round.IsFinalized,
                    FinalizedAt = round.FinalizedAt,
                    RankPosition = ranking?.RankPosition,
                    TotalScore = ranking?.TotalScore,
                    IsAdvanced = round.IsFinalized && !isFinalRound
                        ? ranking?.IsAdvanced == true
                        : null,
                    IsFinalRound = isFinalRound,
                    IsAwarded = round.IsFinalized && isFinalRound
                        ? ranking?.IsAdvanced == true
                        : null,
                    Status = status,
                    IsEligible = eligible,
                    CanSubmit = canSubmit,
                    BlockedReason = blockedReason
                });
            }

            return result;
        }

        private static string GetStatus(
            Rounds round,
            Rankings? ranking,
            bool isFinalRound,
            DateTime now,
            DateTime startAtUtc,
            DateTime effectiveEndAtUtc)
        {
            if (round.IsFinalized)
            {
                if (isFinalRound)
                    return ranking?.IsAdvanced == true ? "Awarded" : "NotAwarded";
                return ranking?.IsAdvanced == true ? "Advanced" : "Eliminated";
            }
            if (now < startAtUtc)
                return "Upcoming";
            if (now >= effectiveEndAtUtc)
                return "AwaitingFinalization";
            return "InProgress";
        }

        private static string GetTimeBlockedReason(
            DateTime now,
            DateTime startAtUtc,
            DateTime submissionDeadline,
            DateTime effectiveEndAtUtc,
            Rounds round)
        {
            if (round.IsFinalized || now >= effectiveEndAtUtc)
                return "Vòng thi đã kết thúc.";
            if (now < startAtUtc)
                return "Vòng thi chưa mở.";
            if (now > submissionDeadline)
                return "Đã quá hạn nộp bài.";
            return "Đội chưa đủ điều kiện nộp bài ở vòng này.";
        }
    }
}
