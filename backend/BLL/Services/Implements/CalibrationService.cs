using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Utilities;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class CalibrationService : ICalibrationService
    {
        private const decimal SignificantDeviationThreshold = 1.5m;

        private readonly IGenericRepository<CalibrationScores> _calibrationScoreRepository;
        private readonly IGenericRepository<Submissions> _submissionRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<Criteria> _criteriaRepository;
        private readonly IGenericRepository<EventCriteria> _eventCriteriaRepository;
        private readonly IGenericRepository<JudgeAssignments> _judgeAssignmentRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly IGenericRepository<Events> _eventRepository;
        private readonly INotificationService _notificationService;
        private readonly IUnitOfWork _unitOfWork;

        public CalibrationService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _calibrationScoreRepository = _unitOfWork.GetRepository<CalibrationScores>();
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _userRepository = _unitOfWork.GetRepository<Users>();
            _criteriaRepository = _unitOfWork.GetRepository<Criteria>();
            _eventCriteriaRepository = _unitOfWork.GetRepository<EventCriteria>();
            _judgeAssignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
            _eventRepository = _unitOfWork.GetRepository<Events>();
        }

        public async Task<CalibrationSubmissionDto> CreateSampleSubmissionAsync(CreateCalibrationSubmissionRequest request, Guid userId)
        {
            var round = await _roundRepository.GetByIdAsync(request.RoundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng với id: {request.RoundId}");

            if (request.TeamId.HasValue && request.TeamId != Guid.Empty)
            {
                var team = await _teamRepository.GetByIdAsync(request.TeamId.Value);
                if (team == null)
                    throw new Exception($"Không tìm thấy đội với id: {request.TeamId}");
            }

            var eventCriteria = await _eventCriteriaRepository.FindAsync(x => x.EventId == round.EventId);
            if (!eventCriteria.Any())
                throw new Exception("Không có tiêu chí nào được cấu hình cho sự kiện vòng này");

            if (string.IsNullOrWhiteSpace(request.RepositoryURL) &&
                string.IsNullOrWhiteSpace(request.DemoURL) &&
                string.IsNullOrWhiteSpace(request.SlideURL))
                throw new Exception("Phải cung cấp ít nhất một URL mẫu artifact");

            var submission = new Submissions
            {
                SubmissionId = Guid.NewGuid(),
                TeamId = request.TeamId,
                RoundId = request.RoundId,
                CalibrationTitle = request.CalibrationTitle,
                RepositoryURL = request.RepositoryURL ?? string.Empty,
                DemoURL = request.DemoURL ?? string.Empty,
                SlideURL = request.SlideURL ?? string.Empty,
                SubmittedAt = DateTime.UtcNow,
                Status = "CalibrationSample",
                IsCalibrationSample = true
            };

            await _submissionRepository.AddAsync(submission);
            await WriteAuditLogAsync(userId, "CALIBRATION_SAMPLE_CREATE", null, JsonSerializer.Serialize(new
            {
                submission.SubmissionId,
                submission.TeamId,
                submission.RoundId,
                submission.CalibrationTitle
            }));

            await _unitOfWork.SaveChangesAsync();

            // Notify all judges about new calibration sample
            await NotifyAllJudgesAsync(submission);

            return await MapSubmissionToDtoAsync(submission);
        }

        public async Task<IEnumerable<CalibrationSubmissionDto>> GetSampleSubmissionsAsync(Guid? eventId = null, string? status = null)
        {
            var normalizedStatus = string.IsNullOrWhiteSpace(status) ? null : status.Trim();
            if (normalizedStatus != null &&
                !new[] { "Pending", "InProgress", "Completed" }
                    .Contains(normalizedStatus, StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Invalid calibration submission status.", nameof(status));
            }

            var submissions = await _submissionRepository.FindAsync(x => x.IsCalibrationSample);
            var dtos = new List<CalibrationSubmissionDto>();
            foreach (var submission in submissions.OrderByDescending(x => x.SubmittedAt))
            {
                dtos.Add(await MapSubmissionToDtoAsync(submission));
            }

            return dtos
                .Where(x => !eventId.HasValue || x.EventId == eventId.Value)
                .Where(x => normalizedStatus == null ||
                    string.Equals(x.Status, normalizedStatus, StringComparison.OrdinalIgnoreCase))
                .DistinctBy(x => x.SubmissionId);
        }

        public async Task<CalibrationSubmissionDto?> GetSampleSubmissionByIdAsync(Guid submissionId)
        {
            var submission = await _submissionRepository.FirstOrDefaultAsync(x => 
                x.SubmissionId == submissionId && x.IsCalibrationSample);
            return submission == null ? null : await MapSubmissionToDtoAsync(submission);
        }

        public async Task<IEnumerable<CalibrationScoreDto>> GetScoresAsync(Guid submissionId)
        {
            await GetCalibrationSubmissionAsync(submissionId);
            var scores = await _calibrationScoreRepository.FindAsync(x => x.SubmissionId == submissionId);
            var criteriaNameById = await GetCriteriaNamesByIdAsync(scores.Select(x => x.CriteriaId));
            
            // Get unique judge IDs and create code mapping
            var judgeIds = scores.Select(x => x.JudgeId).Distinct().ToList();
            var judgeCodeById = new Dictionary<Guid, string>();
            for (int i = 0; i < judgeIds.Count; i++)
            {
                judgeCodeById[judgeIds[i]] = $"Judge {ToAlphabeticCode(i)}";
            }
            
            return scores.Select(s => MapScoreToDto(s, 
                judgeCodeById.TryGetValue(s.JudgeId, out var code) ? code : null,
                criteriaNameById.TryGetValue(s.CriteriaId, out var criteriaName) ? criteriaName : null)).ToList();
        }

        public async Task<(bool hasScored, IEnumerable<CalibrationScoreDto> scores)> GetMyScoresAsync(Guid submissionId, Guid judgeUserId)
        {
            await GetCalibrationSubmissionAsync(submissionId);
            var scores = await _calibrationScoreRepository.FindAsync(x =>
                x.SubmissionId == submissionId && x.JudgeId == judgeUserId);
            var criteriaNameById = await GetCriteriaNamesByIdAsync(scores.Select(x => x.CriteriaId));
            var hasScored = scores.Any();
            return (hasScored, scores.Select(s => MapScoreToDto(
                s,
                "Judge A",
                criteriaNameById.TryGetValue(s.CriteriaId, out var criteriaName) ? criteriaName : null)).ToList());
        }

        public async Task<IEnumerable<CalibrationScoreDto>> SubmitScoresAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request)
        {
            var submission = await GetCalibrationSubmissionAsync(submissionId);
            await EnsureScoringOpenAsync(submission.RoundId);
            await ValidateJudgeAsync(judgeUserId);
            ValidateDuplicateCriteria(request);
            ValidateScoreValues(request);
            await ValidateSubmittedCriteriaSetAsync(submission.RoundId, request);

            var result = new List<CalibrationScores>();
            foreach (var item in request.Scores)
            {
                var existingScore = await _calibrationScoreRepository.FirstOrDefaultAsync(x =>
                    x.SubmissionId == submissionId &&
                    x.JudgeId == judgeUserId &&
                    x.CriteriaId == item.CriteriaId);

                if (existingScore != null)
                    throw new Exception("Điểm calibration đã tồn tại cho tiêu chí này. Sử dụng PUT để cập nhật.");

                var score = new CalibrationScores
                {
                    CalibrationScoreId = Guid.NewGuid(),
                    SubmissionId = submissionId,
                    JudgeId = judgeUserId,
                    CriteriaId = item.CriteriaId,
                    ScoreValue = item.ScoreValue,
                    Comment = item.Comment,
                    ScoredAt = DateTime.UtcNow
                };

                await _calibrationScoreRepository.AddAsync(score);
                result.Add(score);
            }

            await _unitOfWork.SaveChangesAsync();

            // Notify Coordinator that Judge has completed calibration scoring
            await NotifyCoordinatorCalibrationCompleteAsync(submission, judgeUserId);

            return result.Select(s => MapScoreToDto(s)).ToList();
        }

        public async Task<IEnumerable<CalibrationScoreDto>> UpdateScoresAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request)
        {
            var submission = await GetCalibrationSubmissionAsync(submissionId);
            await EnsureScoringOpenAsync(submission.RoundId);
            await ValidateJudgeAsync(judgeUserId);
            ValidateDuplicateCriteria(request);
            ValidateScoreValues(request);
            await ValidateSubmittedCriteriaSetAsync(submission.RoundId, request);

            var result = new List<CalibrationScores>();
            foreach (var item in request.Scores)
            {
                var existingScore = await _calibrationScoreRepository.FirstOrDefaultAsync(x =>
                    x.SubmissionId == submissionId &&
                    x.JudgeId == judgeUserId &&
                    x.CriteriaId == item.CriteriaId);

                if (existingScore == null)
                    throw new Exception("Điểm calibration không tồn tại cho tiêu chí này. Sử dụng POST để nộp trước.");

                existingScore.ScoreValue = item.ScoreValue;
                existingScore.Comment = item.Comment;
                existingScore.ScoredAt = DateTime.UtcNow;
                _calibrationScoreRepository.Update(existingScore);
                result.Add(existingScore);
            }

            await _unitOfWork.SaveChangesAsync();
            return result.Select(s => MapScoreToDto(s)).ToList();
        }

        public async Task<CalibrationAnalysisDto> GetAnalysisAsync(Guid submissionId)
        {
            var submission = await GetCalibrationSubmissionAsync(submissionId);
            var scores = (await _calibrationScoreRepository.FindAsync(x => x.SubmissionId == submissionId)).ToList();
            ValidateAnalysisDataset(scores);

            var criteriaIds = scores.Select(x => x.CriteriaId).Distinct().ToList();
            var criteria = await _criteriaRepository.FindAsync(x => criteriaIds.Contains(x.CriteriaId));
            var criteriaById = criteria.ToDictionary(x => x.CriteriaId, x => x);
            var judgeIds = scores.Select(x => x.JudgeId).Distinct().OrderBy(x => x).ToList();
            var judgeCodeById = judgeIds
                .Select((guid, index) => new { judgeId = guid, code = $"Judge {ToAlphabeticCode(index)}" })
                .ToDictionary(x => x.judgeId, x => x.code);

            var overallMean = scores.Any()
                ? Math.Round(scores.Average(x => x.ScoreValue), 2)
                : 0;

            var analysis = new CalibrationAnalysisDto
            {
                SubmissionId = submission.SubmissionId,
                CalibrationTitle = submission.CalibrationTitle,
                JudgeCount = judgeIds.Count,
                CriteriaCount = criteriaIds.Count,
                OverallMean = overallMean
            };

            analysis.CriteriaVariance = scores
                .GroupBy(x => x.CriteriaId)
                .Select(group =>
                {
                    var values = group.Select(x => x.ScoreValue).ToList();
                    var mean = values.Average();
                    var variance = values.Average(value => (value - mean) * (value - mean));
                    criteriaById.TryGetValue(group.Key, out var criteriaEntity);

                    return new CriteriaVarianceDto
                    {
                        CriteriaId = group.Key,
                        CriteriaName = criteriaEntity?.CriteriaName ?? string.Empty,
                        MeanScore = Math.Round(mean, 2),
                        Variance = Math.Round(variance, 2),
                        StandardDeviation = Math.Round((decimal)Math.Sqrt((double)variance), 2),
                        MinScore = values.Min(),
                        MaxScore = values.Max(),
                        ScoreRange = values.Max() - values.Min()
                    };
                })
                .OrderByDescending(x => x.Variance)
                .ToList();

            analysis.JudgeSummaries = scores
                .GroupBy(x => x.JudgeId)
                .Select(group =>
                {
                    var average = Math.Round(group.Average(x => x.ScoreValue), 2);
                    var deviation = Math.Round(average - overallMean, 2);

                    return new JudgeCalibrationSummaryDto
                    {
                        JudgeId = group.Key,
                        JudgeCode = judgeCodeById[group.Key],
                        AverageScore = average,
                        DeviationFromGroupMean = deviation,
                        ConsistencyLabel = GetConsistencyLabel(deviation)
                    };
                })
                .OrderBy(x => x.JudgeCode)
                .ToList();

            analysis.InconsistencyFlags = analysis.JudgeSummaries
                .Where(x => x.ConsistencyLabel != "Consistent")
                .Select(x => $"{x.JudgeCode} is significantly {x.ConsistencyLabel.ToLowerInvariant()}.")
                .ToList();

            return analysis;
        }

        public async Task<string> ExportDatasetCsvAsync(Guid submissionId, Guid userId)
        {
            var analysis = await GetAnalysisAsync(submissionId);
            var scores = (await _calibrationScoreRepository.FindAsync(x => x.SubmissionId == submissionId)).ToList();
            var criteriaIds = scores.Select(x => x.CriteriaId).Distinct().ToList();
            var criteria = await _criteriaRepository.FindAsync(x => criteriaIds.Contains(x.CriteriaId));
            var criteriaById = criteria.ToDictionary(x => x.CriteriaId, x => x);
            var judgeCodeById = analysis.JudgeSummaries.ToDictionary(x => x.JudgeId, x => x.JudgeCode);
            var varianceByCriteriaId = analysis.CriteriaVariance.ToDictionary(x => x.CriteriaId, x => x);
            var judgeDeviationById = analysis.JudgeSummaries.ToDictionary(x => x.JudgeId, x => x.DeviationFromGroupMean);

            var builder = new StringBuilder();
            builder.AppendLine("SubmissionId,CriteriaId,CriteriaName,JudgeCode,ScoreValue,CriteriaMean,CriteriaVariance,CriteriaStdDev,JudgeDeviation");

            foreach (var score in scores.OrderBy(x => x.CriteriaId).ThenBy(x => judgeCodeById[x.JudgeId]))
            {
                criteriaById.TryGetValue(score.CriteriaId, out var criteriaEntity);
                var variance = varianceByCriteriaId[score.CriteriaId];
                builder.AppendLine(string.Join(",", new[]
                {
                    EscapeCsv(score.SubmissionId.ToString()),
                    EscapeCsv(score.CriteriaId.ToString()),
                    EscapeCsv(criteriaEntity?.CriteriaName ?? string.Empty),
                    EscapeCsv(judgeCodeById[score.JudgeId]),
                    EscapeCsv(score.ScoreValue.ToString("0.##")),
                    EscapeCsv(variance.MeanScore.ToString("0.##")),
                    EscapeCsv(variance.Variance.ToString("0.##")),
                    EscapeCsv(variance.StandardDeviation.ToString("0.##")),
                    EscapeCsv(judgeDeviationById[score.JudgeId].ToString("0.##"))
                }));
            }

            await WriteAuditLogAsync(userId, "CALIBRATION_DATASET_EXPORT", null, JsonSerializer.Serialize(new
            {
                submissionId,
                Rows = scores.Count,
                ExportedAt = DateTime.UtcNow
            }));
            await _unitOfWork.SaveChangesAsync();

            return builder.ToString();
        }

        public async Task DeleteSampleSubmissionAsync(Guid submissionId, Guid userId)
        {
            var submission = await GetCalibrationSubmissionAsync(submissionId);
            
            var scores = await _calibrationScoreRepository.FindAsync(x => x.SubmissionId == submissionId);
            foreach (var score in scores)
            {
                _calibrationScoreRepository.Delete(score);
            }

            await WriteAuditLogAsync(userId, "CALIBRATION_SAMPLE_DELETE", JsonSerializer.Serialize(new
            {
                submission.SubmissionId,
                submission.CalibrationTitle
            }), null);

            _submissionRepository.Delete(submission);
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task<Submissions> GetCalibrationSubmissionAsync(Guid submissionId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Không tìm thấy bài nộp với id: {submissionId}");

            if (!submission.IsCalibrationSample)
                throw new Exception("Bài nộp này không phải là mẫu calibration");

            return submission;
        }

        private async Task EnsureScoringOpenAsync(Guid roundId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId)
                ?? throw new Exception($"Không tìm thấy vòng với id: {roundId}");
            var now = DateTime.UtcNow;

            if (now < round.StartDate)
                throw new Exception("Chấm điểm chưa bắt đầu cho vòng này");
            if (RoundTimePolicy.HasEnded(round.EndDate, now))
                throw new Exception("Thời gian chấm điểm cho vòng này đã kết thúc");
        }

        private async Task ValidateJudgeAsync(Guid judgeUserId)
        {
            var judge = await _userRepository.GetByIdAsync(judgeUserId);
            if (judge == null)
                throw new Exception($"Không tìm thấy giám khảo với id: {judgeUserId}");

            if (!string.Equals(judge.Role, "Judge", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ người dùng có vai trò Giám khảo mới có thể nộp điểm calibration");

            if (!string.Equals(judge.AccountStatus, "Active", StringComparison.OrdinalIgnoreCase))
                throw new Exception("Chỉ các giám khảo đang hoạt động mới có thể nộp điểm calibration");
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

        private static void ValidateAnalysisDataset(List<CalibrationScores> scores)
        {
            if (!scores.Any())
                throw new Exception("Phân tích calibration yêu cầu các điểm calibration đã được nộp");

            var judgeCount = scores.Select(x => x.JudgeId).Distinct().Count();
            if (judgeCount < 2)
                throw new Exception("Phân tích calibration yêu cầu điểm từ ít nhất hai giám khảo");
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

        private async Task WriteAuditLogAsync(Guid userId, string actionType, string? oldValue, string newValue)
        {
            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = actionType,
                OldValue = oldValue,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow
            });
        }

        private async Task<CalibrationSubmissionDto> MapSubmissionToDtoAsync(Submissions submission)
        {
            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            var eventName = round != null ? (await GetEventNameAsync(round.EventId)) : null;

            // Count unique judges who have scored this submission
            var scores = await _calibrationScoreRepository.FindAsync(x => x.SubmissionId == submission.SubmissionId);
            var judgeCount = scores.Select(x => x.JudgeId).Distinct().Count();

            // Calculate status based on scores
            string status;
            if (judgeCount == 0)
                status = "Pending";
            else if (judgeCount >= 2) // Assuming 2 judges are enough to complete
                status = "Completed";
            else
                status = "InProgress";

            return new CalibrationSubmissionDto
            {
                SubmissionId = submission.SubmissionId,
                TeamId = submission.TeamId,
                RoundId = submission.RoundId,
                RoundName = round?.RoundName,
                EventId = round?.EventId,
                EventName = eventName,
                CalibrationTitle = submission.CalibrationTitle,
                RepositoryURL = submission.RepositoryURL,
                DemoURL = submission.DemoURL,
                SlideURL = submission.SlideURL,
                SubmittedAt = submission.SubmittedAt,
                Status = status,
                JudgeCount = judgeCount
            };
        }

        private async Task<string?> GetEventNameAsync(Guid eventId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            return eventEntity?.EventName;
        }

        private async Task<Dictionary<Guid, string>> GetCriteriaNamesByIdAsync(IEnumerable<Guid> criteriaIds)
        {
            var distinctCriteriaIds = criteriaIds.Distinct().ToList();
            if (!distinctCriteriaIds.Any())
                return new Dictionary<Guid, string>();

            var criteria = await _criteriaRepository.FindAsync(x => distinctCriteriaIds.Contains(x.CriteriaId));
            return criteria.ToDictionary(x => x.CriteriaId, x => x.CriteriaName);
        }

        private static CalibrationScoreDto MapScoreToDto(CalibrationScores score, string? judgeCode = null, string? criteriaName = null)
        {
            return new CalibrationScoreDto
            {
                CalibrationScoreId = score.CalibrationScoreId,
                SubmissionId = score.SubmissionId,
                JudgeId = score.JudgeId,
                JudgeCode = judgeCode,
                CriteriaId = score.CriteriaId,
                CriteriaName = criteriaName,
                ScoreValue = score.ScoreValue,
                Comment = score.Comment,
                ScoredAt = score.ScoredAt
            };
        }

        private static string GetConsistencyLabel(decimal deviation)
        {
            if (deviation <= -SignificantDeviationThreshold)
                return "Harsher";

            if (deviation >= SignificantDeviationThreshold)
                return "Lenient";

            return "Consistent";
        }

        private static string ToAlphabeticCode(int index)
        {
            var value = index;
            var result = string.Empty;

            do
            {
                result = (char)('A' + value % 26) + result;
                value = value / 26 - 1;
            }
            while (value >= 0);

            return result;
        }

        private static string EscapeCsv(string value)
        {
            var escaped = value.Replace("\"", "\"\"");
            return $"\"{escaped}\"";
        }

        private async Task NotifyAllJudgesAsync(Submissions submission)
        {
            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            if (round == null) return;

            // Get all judges assigned to this round
            var assignments = await _judgeAssignmentRepository.FindAsync(a => a.RoundId == submission.RoundId);
            var judgeIds = assignments.Select(a => a.UserId).Distinct().ToList();

            var message = $"Bài calibration mới '{submission.CalibrationTitle ?? "Unknown"}' đã được tạo. Vui lòng chấm theo yêu cầu của Coordinator.";

            foreach (var judgeId in judgeIds)
            {
                await _notificationService.CreateNotificationAsync(judgeId, $"[NOTIFICATION] {message}");
            }
        }

        private async Task NotifyCoordinatorCalibrationCompleteAsync(Submissions submission, Guid judgeUserId)
        {
            var judge = await _userRepository.GetByIdAsync(judgeUserId);
            if (judge == null) return;

            // Get all coordinators
            var coordinators = await _userRepository.FindAsync(u => u.Role == "Coordinator" && u.AccountStatus == "Active");

            var message = $"Giám khảo {judge.FullName} đã hoàn thành chấm bài calibration '{submission.CalibrationTitle ?? "Unknown"}'.";

            foreach (var coordinator in coordinators)
            {
                await _notificationService.CreateNotificationAsync(coordinator.UserId, $"[NOTIFICATION] {message}");
            }
        }
    }
}
