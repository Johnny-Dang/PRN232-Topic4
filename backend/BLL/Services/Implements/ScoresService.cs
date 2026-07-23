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
        private readonly IGenericRepository<SubmissionAssets> _submissionAssetRepository;
        private readonly INotificationService _notificationService;
        private readonly IGenericRepository<TeamMembers> _teamMemberRepository;
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
            _submissionAssetRepository = _unitOfWork.GetRepository<SubmissionAssets>();
            _teamMemberRepository = _unitOfWork.GetRepository<TeamMembers>();
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
                    throw new Exception($"Không tìm thấy tiêu chí với id: {item.CriteriaId}");

                var existingScore = await _scoreRepository.FirstOrDefaultAsync(x =>
                    x.SubmissionId == submissionId &&
                    x.AssignmentId == assignment.AssignmentId &&
                    x.CriteriaId == item.CriteriaId);

                if (existingScore != null)
                    throw new Exception("Điểm đã tồn tại cho tiêu chí này. Sử dụng PUT để cập nhật.");

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

            await UpdateSubmissionGradingStatusAsync(submission, result);

            await _unitOfWork.SaveChangesAsync();
            await _rankingService.GenerateAsync(submission.RoundId);

            // Notify Coordinator that Judge has scored
            var judge = await _userRepository.GetByIdAsync(judgeUserId);
            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            var team = await _teamRepository.GetByIdAsync(submission.TeamId!.Value);
            var coordinatorMessage = $"Giám khảo {judge?.FullName ?? judgeUserId.ToString()} đã chấm điểm bài của đội {team?.TeamName ?? "Unknown"}.";
            await NotifyCoordinatorAsync(submission.RoundId, coordinatorMessage);

            // Notify Team Leader that their submission has been scored
            if (team != null)
            {
                var teamLeaderMessage = $"[KẾT QUẢ CHẤM ĐIỂM] Bài dự thi của đội {team.TeamName} cho vòng {round?.RoundName ?? "Unknown"} đã được chấm điểm bởi giám khảo {judge?.FullName ?? "Unknown"}. Vui lòng kiểm tra kết quả!";
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, teamLeaderMessage);
            }

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
                    throw new Exception($"Không tìm thấy tiêu chí với id: {item.CriteriaId}");

                var existingScore = await _scoreRepository.FirstOrDefaultAsync(x =>
                    x.SubmissionId == submissionId &&
                    x.AssignmentId == assignment.AssignmentId &&
                    x.CriteriaId == item.CriteriaId);

                if (existingScore == null)
                    throw new Exception("Điểm không tồn tại cho tiêu chí này. Sử dụng POST để nộp trước.");

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

            await UpdateSubmissionGradingStatusAsync(submission, result);

            await _unitOfWork.SaveChangesAsync();
            await _rankingService.GenerateAsync(submission.RoundId);

            // Notify that scores have been updated and ranking recalculated
            var team = await _teamRepository.GetByIdAsync(submission.TeamId!.Value);
            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            await NotifyJudgeAndCoordinatorAsync(submission.RoundId, $"Điểm bài của đội {team?.TeamName ?? "Unknown"} đã được cập nhật. Bảng xếp hạng đã được tính lại.");

            // Notify Team Leader that their score has been updated
            if (team != null)
            {
                var teamLeaderMessage = $"[CẬP NHẬT ĐIỂM] Điểm bài dự thi của đội {team.TeamName} cho vòng {round?.RoundName ?? "Unknown"} đã được cập nhật bởi giám khảo. Vui lòng kiểm tra kết quả mới!";
                await _notificationService.CreateNotificationAsync(team.TeamLeaderId, teamLeaderMessage);
            }

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
                (x.Status == "Submitted" || x.Status == "Updated" || x.Status == "Graded"));
            var submissionIds = submissions.Select(s => s.SubmissionId).ToList();
            var assignmentIds = assignmentByRoundId.Values.Select(a => a.AssignmentId).ToList();
            var scores = await _scoreRepository.FindAsync(x =>
                submissionIds.Contains(x.SubmissionId) &&
                assignmentIds.Contains(x.AssignmentId));
            var uploadedAssets = await _submissionAssetRepository.FindAsync(x =>
                x.SubmissionId.HasValue &&
                submissionIds.Contains(x.SubmissionId.Value) &&
                x.UploadStatus == "Uploaded");
            var assetsBySubmissionId = uploadedAssets
                .GroupBy(x => x.SubmissionId!.Value)
                .ToDictionary(x => x.Key, x => x.Select(MapAssetToDto).ToList());

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
                        .ToList(),
                    Assets = assetsBySubmissionId.TryGetValue(submission.SubmissionId, out var assets)
                        ? assets
                        : new List<SubmissionAssetDto>()
                });
            }

            return result;
        }

        public async Task<IEnumerable<ScoreDto>> GetScoresBySubmissionForTeamAsync(Guid submissionId, Guid viewerUserId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Không tìm thấy bài nộp với id: {submissionId}");

            if (!submission.TeamId.HasValue)
                throw new Exception("Bài nộp không liên kết với bất kỳ đội nào");

            var team = await _teamRepository.GetByIdAsync(submission.TeamId.Value);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {submission.TeamId}");

            var viewer = await _userRepository.GetByIdAsync(viewerUserId);
            if (viewer == null)
                throw new Exception($"Không tìm thấy người xem với id: {viewerUserId}");

            var role = viewer.Role ?? string.Empty;
            var isTeamViewer = string.Equals(role, "TeamLeader", StringComparison.OrdinalIgnoreCase)
                || string.Equals(role, "TeamMember", StringComparison.OrdinalIgnoreCase);

            if (isTeamViewer)
            {
                var isLeader = team.TeamLeaderId == viewerUserId;
                if (!isLeader)
                {
                    var membership = await _teamMemberRepository.FirstOrDefaultAsync(x =>
                        x.TeamId == team.TeamId && x.UserId == viewerUserId);
                    if (membership == null)
                        throw new Exception("Bạn không có quyền xem điểm của bài nộp này");
                }
            }
            else if (!string.Equals(role, "Judge", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(role, "Coordinator", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(role, "EventCoordinator", StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception("Bạn không có quyền xem điểm của bài nộp này");
            }

            var scores = await _scoreRepository.FindAsync(x => x.SubmissionId == submissionId);
            return scores.Select(MapToDto);
        }

        private async Task<Submissions> GetScorableSubmissionAsync(Guid submissionId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Không tìm thấy bài nộp với id: {submissionId}");

            if (!string.Equals(submission.Status, "Submitted", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(submission.Status, "Updated", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(submission.Status, "Graded", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ các bài nộp đã được nộp mới có thể được chấm điểm");

            if (submission.IsCalibrationSample)
                throw new Exception("Các bài nộp mẫu calibration phải được chấm điểm thông qua quy trình calibration");

            if (!submission.TeamId.HasValue)
                throw new Exception("Bài nộp phải có đội để được chấm điểm");

            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng với id: {submission.RoundId}");

            var team = await _teamRepository.GetByIdAsync(submission.TeamId.Value);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {submission.TeamId}");

            if (team.CategoryId == null)
                throw new Exception("Đội của bài nộp phải có danh mục trước khi có thể chấm điểm");

            var now = DateTime.UtcNow;
            if (now < round.StartDate)
                throw new Exception("Chấm điểm chưa bắt đầu cho vòng này");

            if (now > round.EndDate)
                throw new Exception("Thời gian chấm điểm cho vòng này đã kết thúc");

            return submission;
        }

        private async Task ValidateJudgeUserAsync(Guid judgeUserId)
        {
            var judge = await _userRepository.GetByIdAsync(judgeUserId);
            if (judge == null)
                throw new Exception($"Không tìm thấy giám khảo với id: {judgeUserId}");

            if (!string.Equals(judge.Role, "Judge", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ người dùng có vai trò Giám khảo mới có thể chấm điểm bài nộp");

            if (!string.Equals(judge.AccountStatus, "Active", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ các giám khảo đang hoạt động mới có thể chấm điểm bài nộp");
        }

        private async Task<JudgeAssignments> GetJudgeAssignmentAsync(Guid judgeUserId, Guid roundId)
        {
            var assignment = await _assignmentRepository.FirstOrDefaultAsync(x =>
                x.UserId == judgeUserId && x.RoundId == roundId);

            if (assignment == null)
                throw new Exception("Giám khảo chưa được phân công cho vòng nộp bài này");

            return assignment;
        }

        private static void ValidateDuplicateCriteria(SubmitScoresRequest request)
        {
            if (request.Scores == null || !request.Scores.Any())
                throw new Exception("Yêu cầu chấm điểm phải bao gồm ít nhất một điểm");

            var duplicateCriteria = request.Scores
                .GroupBy(x => x.CriteriaId)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToList();

            if (duplicateCriteria.Any())
                throw new Exception("Tìm thấy tiêu chí trùng lặp trong yêu cầu chấm điểm");
        }

        private static void ValidateScoreValues(SubmitScoresRequest request)
        {
            if (request.Scores.Any(x => x.ScoreValue < 0 || x.ScoreValue > 100))
                throw new Exception("Giá trị điểm phải nằm trong khoảng từ 0 đến 100");
        }

        private async Task ValidateSubmittedCriteriaSetAsync(Guid roundId, SubmitScoresRequest request)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng với id: {roundId}");

            var eventCriteria = await _eventCriteriaRepository.FindAsync(x => x.EventId == round.EventId);
            if (!eventCriteria.Any())
                throw new Exception("Không có tiêu chí nào được cấu hình cho sự kiện vòng này");

            var expectedCriteriaIds = eventCriteria.Select(x => x.CriteriaId).ToHashSet();
            var submittedCriteriaIds = request.Scores.Select(x => x.CriteriaId).ToHashSet();

            if (!expectedCriteriaIds.SetEquals(submittedCriteriaIds))
                throw new Exception("Yêu cầu chấm điểm phải bao gồm chính xác tất cả các tiêu chí được cấu hình cho sự kiện này");
        }

        private async Task UpdateSubmissionGradingStatusAsync(
            Submissions submission,
            IEnumerable<Scores> pendingScores)
        {
            var assignments = await _assignmentRepository.FindAsync(x =>
                x.RoundId == submission.RoundId);
            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng với id: {submission.RoundId}");

            var eventCriteria = await _eventCriteriaRepository.FindAsync(x =>
                x.EventId == round.EventId);
            var expectedCriteriaIds = eventCriteria
                .Select(x => x.CriteriaId)
                .ToHashSet();
            var persistedScores = await _scoreRepository.FindAsync(x =>
                x.SubmissionId == submission.SubmissionId);
            var allScores = persistedScores
                .Concat(pendingScores)
                .GroupBy(x => x.ScoreId)
                .Select(x => x.First())
                .ToList();

            var allAssignedJudgesHaveCompleted = assignments.Any() &&
                expectedCriteriaIds.Any() &&
                assignments.All(assignment =>
                {
                    var scoredCriteriaIds = allScores
                        .Where(score => score.AssignmentId == assignment.AssignmentId)
                        .Select(score => score.CriteriaId)
                        .ToHashSet();
                    return expectedCriteriaIds.SetEquals(scoredCriteriaIds);
                });

            var nextStatus = allAssignedJudgesHaveCompleted
                ? "Graded"
                : string.Equals(submission.Status, "Updated", StringComparison.OrdinalIgnoreCase)
                    ? "Updated"
                    : "Submitted";

            if (!string.Equals(submission.Status, nextStatus, StringComparison.OrdinalIgnoreCase))
            {
                submission.Status = nextStatus;
                _submissionRepository.Update(submission);
            }
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

        private static SubmissionAssetDto MapAssetToDto(SubmissionAssets asset)
        {
            return new SubmissionAssetDto
            {
                SubmissionAssetId = asset.SubmissionAssetId,
                SubmissionId = asset.SubmissionId,
                TeamId = asset.TeamId,
                RoundId = asset.RoundId,
                AssetType = asset.AssetType,
                Provider = asset.Provider,
                CloudinaryAssetId = asset.CloudinaryAssetId,
                PublicId = asset.PublicId,
                SecureUrl = asset.SecureUrl,
                ResourceType = asset.ResourceType,
                OriginalFileName = asset.OriginalFileName,
                Format = asset.Format,
                ContentType = asset.ContentType,
                FileSize = asset.FileSize,
                DurationSeconds = asset.DurationSeconds,
                UploadStatus = asset.UploadStatus,
                CreatedAt = asset.CreatedAt,
                UploadedAt = asset.UploadedAt
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
