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
        private readonly IGenericRepository<EventCriteria> _eventCriteriaRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly INotificationService _notificationService;
        private readonly IRankingService _rankingService;
        private readonly IUnitOfWork _unitOfWork;

        public ScoresService(IUnitOfWork unitOfWork, IRankingService rankingService, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _rankingService = rankingService;
            _notificationService = notificationService;
            _scoreRepository = _unitOfWork.GetRepository<Scores>();
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
            _assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            _criteriaRepository = _unitOfWork.GetRepository<Criteria>();
            _eventCriteriaRepository = _unitOfWork.GetRepository<EventCriteria>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _userRepository = _unitOfWork.GetRepository<Users>();
        }

        public async Task<IEnumerable<ScoreDto>> SubmitForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request)
        {
            await ValidateJudgeUserAsync(judgeUserId);
            var submission = await GetScorableSubmissionAsync(submissionId);
            var assignment = await GetJudgeAssignmentAsync(judgeUserId, submission.RoundId);

            ValidateDuplicateCriteria(request);
            ValidateScoreValues(request);
            await ValidateSubmittedCriteriaSetAsync(submission.RoundId, request);

            var result = new List<Scores>();
            foreach (var item in request.Scores)
            {
                var criteria = await _criteriaRepository.GetByIdAsync(item.CriteriaId);
                if (criteria == null)
                    throw new Exception($"Criteria with id {item.CriteriaId} not found");

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

            // Notify Coordinator that Judge has scored
            var judge = await _userRepository.GetByIdAsync(judgeUserId);
            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            var team = await _teamRepository.GetByIdAsync(submission.TeamId!.Value);
            var coordinatorMessage = $"Giám khảo {judge?.FullName ?? judgeUserId.ToString()} đã chấm điểm bài của đội {team?.TeamName ?? "Unknown"}.";
            await NotifyCoordinatorAsync(submission.RoundId, coordinatorMessage);

            return result.Select(MapToDto);
        }

        public async Task<IEnumerable<ScoreDto>> UpdateForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request)
        {
            await ValidateJudgeUserAsync(judgeUserId);
            var submission = await GetScorableSubmissionAsync(submissionId);
            var assignment = await GetJudgeAssignmentAsync(judgeUserId, submission.RoundId);

            ValidateDuplicateCriteria(request);
            ValidateScoreValues(request);
            await ValidateSubmittedCriteriaSetAsync(submission.RoundId, request);

            var result = new List<Scores>();
            foreach (var item in request.Scores)
            {
                var criteria = await _criteriaRepository.GetByIdAsync(item.CriteriaId);
                if (criteria == null)
                    throw new Exception($"Criteria with id {item.CriteriaId} not found");

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

                await _auditLogRepository.AddAsync(new AuditLogs
                {
                    LogId = Guid.NewGuid(),
                    UserId = judgeUserId,
                    ActionType = "SCORE_UPDATE",
                    OldValue = JsonSerializer.Serialize(oldValue),
                    NewValue = JsonSerializer.Serialize(new
                    {
                        existingScore.ScoreId,
                        existingScore.SubmissionId,
                        existingScore.AssignmentId,
                        existingScore.CriteriaId,
                        existingScore.ScoreValue,
                        existingScore.Comment
                    }),
                    CreatedAt = DateTime.UtcNow
                });

                result.Add(existingScore);
            }

            await _unitOfWork.SaveChangesAsync();
            await _rankingService.GenerateAsync(submission.RoundId);

            // Notify that scores have been updated and ranking recalculated
            var team = await _teamRepository.GetByIdAsync(submission.TeamId!.Value);
            var updateMessage = $"Điểm bài của đội {team?.TeamName ?? "Unknown"} đã được cập nhật. Bảng xếp hạng đã được tính lại.";
            await NotifyJudgeAndCoordinatorAsync(submission.RoundId, updateMessage);

            return result.Select(MapToDto);
        }

        public async Task<IEnumerable<JudgeSubmissionDto>> GetAssignedSubmissionsAsync(Guid judgeUserId)
        {
            await ValidateJudgeUserAsync(judgeUserId);
            var assignments = await _assignmentRepository.FindAsync(x => x.UserId == judgeUserId);
            var assignmentByRoundId = assignments
                .GroupBy(x => x.RoundId)
                .ToDictionary(x => x.Key, x => x.First());

            if (!assignmentByRoundId.Any())
                return Enumerable.Empty<JudgeSubmissionDto>();

            var roundIds = assignmentByRoundId.Keys.ToList();
            var submissions = await _submissionRepository.FindAsync(x =>
                roundIds.Contains(x.RoundId) &&
                !x.IsCalibrationSample &&
                (x.Status == "Submitted" || x.Status == "Updated"));
            var submissionIds = submissions.Select(s => s.SubmissionId).ToList();
            var assignmentIds = assignmentByRoundId.Values.Select(a => a.AssignmentId).ToList();
            var scores = await _scoreRepository.FindAsync(x =>
                submissionIds.Contains(x.SubmissionId) &&
                assignmentIds.Contains(x.AssignmentId));

            var result = new List<JudgeSubmissionDto>();
            foreach (var submission in submissions)
            {
                if (!submission.TeamId.HasValue) continue;
                var team = await _teamRepository.GetByIdAsync(submission.TeamId.Value);
                var assignment = assignmentByRoundId[submission.RoundId];

                result.Add(new JudgeSubmissionDto
                {
                    SubmissionId = submission.SubmissionId,
                    TeamId = submission.TeamId.Value,
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

        private async Task<Submissions> GetScorableSubmissionAsync(Guid submissionId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Submission with id {submissionId} not found");

            if (!string.Equals(submission.Status, "Submitted", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(submission.Status, "Updated", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Only submitted submissions can be scored");

            if (submission.IsCalibrationSample)
                throw new Exception("Calibration sample submissions must be scored through the calibration workflow");

            if (!submission.TeamId.HasValue)
                throw new Exception("Submission must have a team to be scored");

            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            if (round == null)
                throw new Exception($"Round with id {submission.RoundId} not found");

            var team = await _teamRepository.GetByIdAsync(submission.TeamId.Value);
            if (team == null)
                throw new Exception($"Team with id {submission.TeamId} not found");

            if (team.CategoryId == null)
                throw new Exception("Submission team must have a category before it can be scored");

            var now = DateTime.UtcNow;
            if (now < round.StartDate)
                throw new Exception("Scoring has not started for this round");

            if (now > round.EndDate)
                throw new Exception("Scoring period for this round has ended");

            return submission;
        }

        private async Task ValidateJudgeUserAsync(Guid judgeUserId)
        {
            var judge = await _userRepository.GetByIdAsync(judgeUserId);
            if (judge == null)
                throw new Exception($"Judge with id {judgeUserId} not found");

            if (!string.Equals(judge.Role, "Judge", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Only users with Judge role can score submissions");

            if (!string.Equals(judge.AccountStatus, "Active", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Only active judges can score submissions");
        }

        private async Task<JudgeAssignments> GetJudgeAssignmentAsync(Guid judgeUserId, Guid roundId)
        {
            var assignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.UserId == judgeUserId && x.RoundId == roundId);

            if (assignment == null)
                throw new Exception("Judge is not assigned to this submission round");

            return assignment;
        }

        private static void ValidateDuplicateCriteria(SubmitScoresRequest request)
        {
            if (request.Scores == null || !request.Scores.Any())
                throw new Exception("Score request must include at least one score");

            var duplicateCriteria = request.Scores
                .GroupBy(x => x.CriteriaId)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToList();

            if (duplicateCriteria.Any())
                throw new Exception("Duplicate criteria found in score request");
        }

        private static void ValidateScoreValues(SubmitScoresRequest request)
        {
            if (request.Scores.Any(x => x.ScoreValue < 0 || x.ScoreValue > 100))
                throw new Exception("Score value must be between 0 and 100");
        }

        private async Task ValidateSubmittedCriteriaSetAsync(Guid roundId, SubmitScoresRequest request)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");

            var eventCriteria = await _eventCriteriaRepository.FindAsync(x => x.EventId == round.EventId);
            if (!eventCriteria.Any())
                throw new Exception("No criteria configured for this round event");

            var expectedCriteriaIds = eventCriteria.Select(x => x.CriteriaId).ToHashSet();
            var submittedCriteriaIds = request.Scores.Select(x => x.CriteriaId).ToHashSet();

            if (!expectedCriteriaIds.SetEquals(submittedCriteriaIds))
                throw new Exception("Score request must include exactly all criteria configured for this event");
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

        private async Task NotifyCoordinatorAsync(Guid roundId, string message)
        {
            // Get all coordinators from the event via rounds
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null) return;

            // Get all users with Coordinator role
            var coordinators = await _userRepository.FindAsync(u => u.Role == "Coordinator" && u.AccountStatus == "Active");
            foreach (var coordinator in coordinators)
            {
                await _notificationService.CreateNotificationAsync(coordinator.UserId, $"[NOTIFICATION] {message}");
            }
        }

        private async Task NotifyJudgeAndCoordinatorAsync(Guid roundId, string message)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null) return;

            // Get all judges assigned to this round
            var assignments = await _assignmentRepository.FindAsync(a => a.RoundId == roundId);
            var judgeIds = assignments.Select(a => a.UserId).Distinct().ToList();

            // Get all coordinators
            var coordinators = await _userRepository.FindAsync(u => u.Role == "Coordinator" && u.AccountStatus == "Active");

            var allUserIds = judgeIds.Concat(coordinators.Select(c => c.UserId)).Distinct();

            foreach (var userId in allUserIds)
            {
                await _notificationService.CreateNotificationAsync(userId, $"[NOTIFICATION] {message}");
            }
        }
    }
}
