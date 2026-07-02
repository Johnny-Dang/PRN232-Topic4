using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class RankingService : IRankingService
    {
        private readonly IGenericRepository<Rankings> _rankingRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Submissions> _submissionRepository;
        private readonly IGenericRepository<Scores> _scoreRepository;
        private readonly IGenericRepository<EventCriteria> _eventCriteriaRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<AdvancementRules> _advancementRuleRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RankingService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _rankingRepository = _unitOfWork.GetRepository<Rankings>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
            _scoreRepository = _unitOfWork.GetRepository<Scores>();
            _eventCriteriaRepository = _unitOfWork.GetRepository<EventCriteria>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _advancementRuleRepository = _unitOfWork.GetRepository<AdvancementRules>();
        }

        public async Task<IEnumerable<RankingDto>> GenerateAsync(Guid roundId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");

            var eventCriteria = await _eventCriteriaRepository.FindAsync(x => x.EventId == round.EventId);
            if (!eventCriteria.Any())
                throw new Exception("No criteria configured for this round event");

            var submissions = await _submissionRepository.FindAsync(x =>
                x.RoundId == roundId &&
                !x.IsCalibrationSample &&
                (x.Status == "Submitted" || x.Status == "Updated"));
            if (!submissions.Any())
                return Enumerable.Empty<RankingDto>();

            var submissionIds = submissions.Select(x => x.SubmissionId).ToList();
            var teamIds = submissions.Select(x => x.TeamId).Distinct().ToList();
            var teams = await _teamRepository.FindAsync(x => teamIds.Contains(x.TeamId));
            var teamsById = teams.ToDictionary(x => x.TeamId, x => x);

            var scores = await _scoreRepository.FindAsync(x => submissionIds.Contains(x.SubmissionId));
            var existingRankings = await _rankingRepository.FindAsync(x => x.RoundId == roundId);
            var generatedAt = DateTime.UtcNow;

            var weightByCriteriaId = NormalizeWeights(eventCriteria);
            var calculatedRankings = submissions
                .Select(submission =>
                {
                    if (!teamsById.TryGetValue(submission.TeamId, out var team) || team.CategoryId == null)
                        return null;

                    var submissionScores = scores.Where(x => x.SubmissionId == submission.SubmissionId).ToList();
                    if (!submissionScores.Any())
                        return null;

                    var judgeTotals = submissionScores
                        .GroupBy(x => x.AssignmentId)
                        .Select(group => group.Sum(score =>
                            weightByCriteriaId.TryGetValue(score.CriteriaId, out var weight)
                                ? score.ScoreValue * weight
                                : 0))
                        .ToList();

                    if (!judgeTotals.Any())
                        return null;

                    return new CalculatedRanking
                    {
                        TeamId = team.TeamId,
                        TeamName = team.TeamName,
                        CategoryId = team.CategoryId.Value,
                        TotalScore = Math.Round(judgeTotals.Average(), 2)
                    };
                })
                .Where(x => x != null)
                .Cast<CalculatedRanking>()
                .GroupBy(x => x.CategoryId)
                .SelectMany(categoryGroup => categoryGroup
                    .OrderByDescending(x => x.TotalScore)
                    .ThenBy(x => x.TeamName)
                    .Select((ranking, index) =>
                    {
                        ranking.RankPosition = index + 1;
                        return ranking;
                    }))
                .ToList();

            foreach (var calculated in calculatedRankings)
            {
                var existing = existingRankings.FirstOrDefault(x =>
                    x.TeamId == calculated.TeamId &&
                    x.CategoryId == calculated.CategoryId);

                if (existing == null)
                {
                    await _rankingRepository.AddAsync(new Rankings
                    {
                        RankingId = Guid.NewGuid(),
                        TeamId = calculated.TeamId,
                        RoundId = roundId,
                        CategoryId = calculated.CategoryId,
                        RankPosition = calculated.RankPosition,
                        TotalScore = calculated.TotalScore,
                        GeneratedAt = generatedAt
                    });

                    continue;
                }

                existing.RankPosition = calculated.RankPosition;
                existing.TotalScore = calculated.TotalScore;
                existing.GeneratedAt = generatedAt;
                _rankingRepository.Update(existing);
            }

            var staleRankings = existingRankings
                .Where(existing => !calculatedRankings.Any(calculated =>
                    calculated.TeamId == existing.TeamId &&
                    calculated.CategoryId == existing.CategoryId))
                .ToList();

            foreach (var staleRanking in staleRankings)
            {
                _rankingRepository.Delete(staleRanking);
            }

            await _unitOfWork.SaveChangesAsync();
            return await GetByRoundAsync(roundId);
        }

        public async Task<IEnumerable<RankingDto>> GetByRoundAsync(Guid roundId, Guid? categoryId = null)
        {
            var rankings = categoryId == null
                ? await _rankingRepository.FindAsync(x => x.RoundId == roundId)
                : await _rankingRepository.FindAsync(x => x.RoundId == roundId && x.CategoryId == categoryId.Value);

            if (!rankings.Any())
                return Enumerable.Empty<RankingDto>();

            var rules = await _advancementRuleRepository.FindAsync(x => x.RoundId == roundId);
            var ruleTopNByCategoryId = rules
                .GroupBy(x => x.CategoryId)
                .ToDictionary(x => x.Key, x => x.Min(rule => rule.TopN));
            var teamIds = rankings.Select(x => x.TeamId).Distinct().ToList();
            var teams = await _teamRepository.FindAsync(x => teamIds.Contains(x.TeamId));
            var teamsById = teams.ToDictionary(x => x.TeamId, x => x);

            return rankings
                .OrderBy(x => x.CategoryId)
                .ThenBy(x => x.RankPosition)
                .Select(ranking =>
                {
                    teamsById.TryGetValue(ranking.TeamId, out var team);
                    var hasRule = ruleTopNByCategoryId.TryGetValue(ranking.CategoryId, out var topN);

                    return new RankingDto
                    {
                        RankingId = ranking.RankingId,
                        TeamId = ranking.TeamId,
                        TeamName = team?.TeamName ?? string.Empty,
                        RoundId = ranking.RoundId,
                        CategoryId = ranking.CategoryId,
                        RankPosition = ranking.RankPosition,
                        TotalScore = ranking.TotalScore,
                        GeneratedAt = ranking.GeneratedAt,
                        IsAdvanced = hasRule && ranking.RankPosition <= topN
                    };
                });
        }

        private static Dictionary<Guid, decimal> NormalizeWeights(IEnumerable<EventCriteria> eventCriteria)
        {
            var criteria = eventCriteria.ToList();
            var totalWeight = criteria.Sum(x => x.Weight);
            var divisor = totalWeight > 1 ? 100 : 1;

            return criteria.ToDictionary(x => x.CriteriaId, x => x.Weight / divisor);
        }

        private class CalculatedRanking
        {
            public Guid TeamId { get; set; }
            public string TeamName { get; set; } = string.Empty;
            public Guid CategoryId { get; set; }
            public int RankPosition { get; set; }
            public decimal TotalScore { get; set; }
        }
    }
}
