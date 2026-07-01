using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class ScoresService : IScoresService
    {
        private readonly IGenericRepository<Scores> _scoreRepository;
        private readonly IGenericRepository<Submissions> _submissionRepository;
        private readonly IGenericRepository<JudgeAssignments> _assignmentRepository;
        private readonly IGenericRepository<Criteria> _criteriaRepository;
        private readonly INotificationService _notificationService;
        private readonly IGenericRepository<EventCriteria> _eventCriteriaRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IRankingService _rankingService;
        private readonly IUnitOfWork _unitOfWork;

        public ScoresService(IUnitOfWork unitOfWork, INotificationService notificationService, IRankingService rankingService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _rankingService = rankingService;
            _scoreRepository = _unitOfWork.GetRepository<Scores>();
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
            _assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            _criteriaRepository = _unitOfWork.GetRepository<Criteria>();
            _eventCriteriaRepository = _unitOfWork.GetRepository<EventCriteria>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
        }

        public async Task<ScoreDto> CreateAsync(AddScoreRequest request)
        {
            var submission = await _submissionRepository.GetByIdAsync(request.SubmissionId);
            if (submission == null)
                throw new Exception($"Submission with id {request.SubmissionId} not found");

            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
                throw new Exception($"Judge Assignment with id {request.AssignmentId} not found");

            if (assignment.RoundId != submission.RoundId)
                throw new Exception("Judge assignment does not match the submission round");

            var criteria = await _criteriaRepository.GetByIdAsync(request.CriteriaId);
            if (criteria == null)
                throw new Exception($"Criteria with id {request.CriteriaId} not found");

            await ValidateCriteriaBelongsToRoundEventAsync(submission.RoundId, request.CriteriaId);

            var existingScore = await _scoreRepository.FirstOrDefaultAsync(x =>
                x.SubmissionId == request.SubmissionId &&
                x.AssignmentId == request.AssignmentId &&
                x.CriteriaId == request.CriteriaId);

            if (existingScore != null)
                throw new Exception("Score already exists for this submission, assignment, and criteria. Use update instead.");

            var score = new Scores
            {
                ScoreId = Guid.NewGuid(),
                SubmissionId = request.SubmissionId,
                AssignmentId = request.AssignmentId,
                CriteriaId = request.CriteriaId,
                ScoreValue = request.ScoreValue,
                Comment = request.Comment,
                ScoredAt = DateTime.UtcNow
            };

            var created = await _scoreRepository.AddAsync(score);
            await _unitOfWork.SaveChangesAsync();
            await _rankingService.GenerateAsync(submission.RoundId);

            var teamRepository = _unitOfWork.GetRepository<Teams>();
            var team = await teamRepository.GetByIdAsync(submission.TeamId);
            if (team != null)
            {
                var roundRepository = _unitOfWork.GetRepository<Rounds>();
                var round = await roundRepository.GetByIdAsync(submission.RoundId);
                var roundName = round?.RoundName ?? "Unknown Round";
                var message = $"[NOTIFICATION] Bài thi của đội {team.TeamName} tại vòng {roundName} đã được chấm điểm cho tiêu chí {criteria.CriteriaName} bởi Giám khảo.";
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, message);
            }

            return MapToDto(created);
        }

        public async Task<IEnumerable<ScoreDto>> SubmitForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Submission with id {submissionId} not found");

            var assignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.UserId == judgeUserId && x.RoundId == submission.RoundId);

            if (assignment == null)
                throw new Exception("Judge is not assigned to this submission round");

            var duplicateCriteria = request.Scores
                .GroupBy(x => x.CriteriaId)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToList();

            if (duplicateCriteria.Any())
                throw new Exception("Duplicate criteria found in score request");

            var result = new List<Scores>();

            foreach (var item in request.Scores)
            {
                var criteria = await _criteriaRepository.GetByIdAsync(item.CriteriaId);
                if (criteria == null)
                    throw new Exception($"Criteria with id {item.CriteriaId} not found");

                await ValidateCriteriaBelongsToRoundEventAsync(submission.RoundId, item.CriteriaId);

                var existingScore = await _scoreRepository.FirstOrDefaultAsync(x =>
                    x.SubmissionId == submissionId &&
                    x.AssignmentId == assignment.AssignmentId &&
                    x.CriteriaId == item.CriteriaId);

                if (existingScore != null)
                    throw new Exception("Score already exists for this criteria. Use PUT to update it.");

                var score = new Scores
                {
                    ScoreId = Guid.NewGuid(),
                    SubmissionId = submissionId,
                    AssignmentId = assignment.AssignmentId,
                    CriteriaId = item.CriteriaId,
                    ScoreValue = item.ScoreValue,
                    Comment = item.Comment,
                    ScoredAt = DateTime.UtcNow
                };

                await _scoreRepository.AddAsync(score);
                result.Add(score);
            }

            await _unitOfWork.SaveChangesAsync();
            await _rankingService.GenerateAsync(submission.RoundId);
            return result.Select(MapToDto);
        }

        public async Task<IEnumerable<ScoreDto>> UpdateForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Submission with id {submissionId} not found");

            var assignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.UserId == judgeUserId && x.RoundId == submission.RoundId);

            if (assignment == null)
                throw new Exception("Judge is not assigned to this submission round");

            var duplicateCriteria = request.Scores
                .GroupBy(x => x.CriteriaId)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToList();

            if (duplicateCriteria.Any())
                throw new Exception("Duplicate criteria found in score request");

            var result = new List<Scores>();

            foreach (var item in request.Scores)
            {
                var criteria = await _criteriaRepository.GetByIdAsync(item.CriteriaId);
                if (criteria == null)
                    throw new Exception($"Criteria with id {item.CriteriaId} not found");

                await ValidateCriteriaBelongsToRoundEventAsync(submission.RoundId, item.CriteriaId);

                var existingScore = await _scoreRepository.FirstOrDefaultAsync(x =>
                    x.SubmissionId == submissionId &&
                    x.AssignmentId == assignment.AssignmentId &&
                    x.CriteriaId == item.CriteriaId);

                if (existingScore == null)
                    throw new Exception("Score does not exist for this criteria. Use POST to submit it first.");

                var oldValue = new
                {
                    existingScore.ScoreId,
                    existingScore.SubmissionId,
                    existingScore.AssignmentId,
                    existingScore.CriteriaId,
                    existingScore.ScoreValue,
                    existingScore.Comment
                };

                existingScore.ScoreValue = item.ScoreValue;
                existingScore.Comment = item.Comment;
                existingScore.ScoredAt = DateTime.UtcNow;
                _scoreRepository.Update(existingScore);

                var newValue = new
                {
                    existingScore.ScoreId,
                    existingScore.SubmissionId,
                    existingScore.AssignmentId,
                    existingScore.CriteriaId,
                    existingScore.ScoreValue,
                    existingScore.Comment
                };

                await _auditLogRepository.AddAsync(new AuditLogs
                {
                    LogId = Guid.NewGuid(),
                    UserId = judgeUserId,
                    ActionType = "SCORE_UPDATE",
                    OldValue = JsonSerializer.Serialize(oldValue),
                    NewValue = JsonSerializer.Serialize(newValue),
                    CreatedAt = DateTime.UtcNow
                });

                result.Add(existingScore);
            }

            await _unitOfWork.SaveChangesAsync();
            await _rankingService.GenerateAsync(submission.RoundId);
            return result.Select(MapToDto);
        }

        public async Task<IEnumerable<JudgeSubmissionDto>> GetAssignedSubmissionsAsync(Guid judgeUserId)
        {
            var assignments = await _assignmentRepository.FindAsync(x => x.UserId == judgeUserId);
            var assignmentByRoundId = assignments
                .GroupBy(x => x.RoundId)
                .ToDictionary(x => x.Key, x => x.First());

            if (!assignmentByRoundId.Any())
                return Enumerable.Empty<JudgeSubmissionDto>();

            var roundIds = assignmentByRoundId.Keys.ToList();
            var submissions = await _submissionRepository.FindAsync(x => roundIds.Contains(x.RoundId));
            var submissionIds = submissions.Select(s => s.SubmissionId).ToList();
            var assignmentIds = assignmentByRoundId.Values.Select(a => a.AssignmentId).ToList();
            var scores = await _scoreRepository.FindAsync(x =>
                submissionIds.Contains(x.SubmissionId) &&
                assignmentIds.Contains(x.AssignmentId));

            var result = new List<JudgeSubmissionDto>();
            foreach (var submission in submissions)
            {
                var team = await _teamRepository.GetByIdAsync(submission.TeamId);
                var assignment = assignmentByRoundId[submission.RoundId];

                result.Add(new JudgeSubmissionDto
                {
                    SubmissionId = submission.SubmissionId,
                    TeamId = submission.TeamId,
                    TeamName = team?.TeamName ?? string.Empty,
                    RoundId = submission.RoundId,
                    AssignmentId = assignment.AssignmentId,
                    CategoryId = team?.CategoryId,
                    RepositoryURL = submission.RepositoryURL,
                    DemoURL = submission.DemoURL,
                    SlideURL = submission.SlideURL,
                    SubmittedAt = submission.SubmittedAt,
                    Status = submission.Status,
                    Scores = scores
                        .Where(x => x.SubmissionId == submission.SubmissionId && x.AssignmentId == assignment.AssignmentId)
                        .Select(MapToDto)
                        .ToList()
                });
            }

            return result;
        }

        public async Task<ScoreDto?> GetByIdAsync(Guid scoreId)
        {
            var score = await _scoreRepository.GetByIdAsync(scoreId);
            if (score == null) return null;
            return MapToDto(score);
        }

        public async Task<IEnumerable<ScoreDto>> GetAllAsync()
        {
            var scores = await _scoreRepository.GetAllAsync();
            return scores.Select(MapToDto);
        }

        public async Task<ScoreDto> UpdateAsync(UpdateScoreRequest request)
        {
            var score = await _scoreRepository.GetByIdAsync(request.ScoreId);
            if (score == null)
                throw new Exception($"Score with id {request.ScoreId} not found");

            var submission = await _submissionRepository.GetByIdAsync(request.SubmissionId);
            if (submission == null)
                throw new Exception($"Submission with id {request.SubmissionId} not found");

            var assignment = await _assignmentRepository.GetByIdAsync(request.AssignmentId);
            if (assignment == null)
                throw new Exception($"Judge Assignment with id {request.AssignmentId} not found");

            if (assignment.RoundId != submission.RoundId)
                throw new Exception("Judge assignment does not match the submission round");

            var criteria = await _criteriaRepository.GetByIdAsync(request.CriteriaId);
            if (criteria == null)
                throw new Exception($"Criteria with id {request.CriteriaId} not found");

            await ValidateCriteriaBelongsToRoundEventAsync(submission.RoundId, request.CriteriaId);

            var duplicateScore = await _scoreRepository.FirstOrDefaultAsync(x =>
                x.ScoreId != request.ScoreId &&
                x.SubmissionId == request.SubmissionId &&
                x.AssignmentId == request.AssignmentId &&
                x.CriteriaId == request.CriteriaId);

            if (duplicateScore != null)
                throw new Exception("Another score already exists for this submission, assignment, and criteria");

            var oldValue = new
            {
                score.ScoreId,
                score.SubmissionId,
                score.AssignmentId,
                score.CriteriaId,
                score.ScoreValue,
                score.Comment
            };

            score.SubmissionId = request.SubmissionId;
            score.AssignmentId = request.AssignmentId;
            score.CriteriaId = request.CriteriaId;
            score.ScoreValue = request.ScoreValue;
            score.Comment = request.Comment;
            score.ScoredAt = DateTime.UtcNow;

            _scoreRepository.Update(score);

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = assignment.UserId,
                ActionType = "SCORE_UPDATE",
                OldValue = JsonSerializer.Serialize(oldValue),
                NewValue = JsonSerializer.Serialize(new
                {
                    score.ScoreId,
                    score.SubmissionId,
                    score.AssignmentId,
                    score.CriteriaId,
                    score.ScoreValue,
                    score.Comment
                }),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();
            await _rankingService.GenerateAsync(submission.RoundId);

            var teamRepository = _unitOfWork.GetRepository<Teams>();
            var team = await teamRepository.GetByIdAsync(submission.TeamId);
            if (team != null)
            {
                var roundRepository = _unitOfWork.GetRepository<Rounds>();
                var round = await roundRepository.GetByIdAsync(submission.RoundId);
                var roundName = round?.RoundName ?? "Unknown Round";
                var message = $"[NOTIFICATION] Bài thi của đội {team.TeamName} tại vòng {roundName} đã được cập nhật điểm cho tiêu chí {criteria.CriteriaName} bởi Giám khảo.";
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, message);
            }

            return MapToDto(score);
        }

        public async Task DeleteAsync(Guid scoreId)
        {
            var score = await _scoreRepository.GetByIdAsync(scoreId);
            if (score == null)
                throw new Exception($"Score with id {scoreId} not found");

            _scoreRepository.Delete(score);
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task ValidateCriteriaBelongsToRoundEventAsync(Guid roundId, Guid criteriaId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");

            var eventCriteria = await _eventCriteriaRepository.FirstOrDefaultAsync(x =>
                x.EventId == round.EventId && x.CriteriaId == criteriaId);

            if (eventCriteria == null)
                throw new Exception("Criteria is not configured for the submission event");
        }

        private static ScoreDto MapToDto(Scores score)
        {
            return new ScoreDto
            {
                ScoreId = score.ScoreId,
                SubmissionId = score.SubmissionId,
                AssignmentId = score.AssignmentId,
                CriteriaId = score.CriteriaId,
                ScoreValue = score.ScoreValue,
                Comment = score.Comment,
                ScoredAt = score.ScoredAt
            };
        }
    }
}
