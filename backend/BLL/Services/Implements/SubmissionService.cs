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
    public class SubmissionService : ISubmissionService
    {
        private readonly IGenericRepository<Submissions> _submissionRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly INotificationService _notificationService;
        private readonly ISubmissionAssetService _submissionAssetService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;

        public SubmissionService(IUnitOfWork unitOfWork, INotificationService notificationService, ISubmissionAssetService submissionAssetService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _submissionAssetService = submissionAssetService;
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<SubmissionDto> CreateAsync(AddSubmissionRequest request, Guid userId)
        {
            var team = await _teamRepository.GetByIdAsync(request.TeamId);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {request.TeamId}");

            if (team.TeamLeaderId != userId)
                throw new Exception("Chỉ trưởng nhóm mới có thể nộp bài dự án.");

            var round = await _roundRepository.GetByIdAsync(request.RoundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng thi với id: {request.RoundId}");

            if (team.EventId != null && team.EventId != round.EventId)
                throw new Exception("Vòng thi không thuộc sự kiện của đội.");

            var now = DateTime.UtcNow;
            if (now < round.StartDate)
                throw new Exception($"Vòng thi chưa mở. Bài nộp sẽ được chấp nhận từ {round.StartDate:yyyy-MM-dd HH:mm:ss} UTC.");
            if (now > round.SubmissionDeadline)
                throw new Exception("Đã quá hạn nộp bài. Bạn không thể tạo bài nộp mới.");

            var existingSubmission = await _submissionRepository.FirstOrDefaultAsync(x => x.TeamId == request.TeamId && x.RoundId == request.RoundId);
            if (existingSubmission != null)
                throw new Exception("Đội này đã có bài nộp cho vòng này. Vui lòng sử dụng chức năng cập nhật.");

            var submission = new Submissions
            {
                SubmissionId = Guid.NewGuid(),
                TeamId = request.TeamId,
                RoundId = request.RoundId,
                RepositoryURL = request.RepositoryURL?.Trim() ?? string.Empty,
                DemoURL = request.DemoURL?.Trim() ?? string.Empty,
                SlideURL = request.SlideURL?.Trim() ?? string.Empty,
                SubmittedAt = now,
                Status = "Submitted"
            };

            var created = await _submissionRepository.AddAsync(submission);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "SUBMISSION_CREATE",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(new
                {
                    submission.SubmissionId,
                    submission.TeamId,
                    submission.RoundId,
                    submission.RepositoryURL,
                    submission.DemoURL,
                    submission.SlideURL,
                    submission.SubmittedAt,
                    submission.Status
                }),
                CreatedAt = DateTime.UtcNow
            };
            await _auditLogRepository.AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();
            await _submissionAssetService.AttachAssetsToSubmissionAsync(created.SubmissionId, request.TeamId, request.RoundId, request.VideoAssetId, request.SlideAssetId, userId);
            await NotifyAssignedJudgesAsync(request.RoundId, $"[NOTIFICATION] Đội thi {team.TeamName} đã nộp bài dự thi cho vòng {round.RoundName}. Vui lòng truy cập để chấm điểm.");

            return MapToDto(created);
        }

        public async Task<SubmissionDto?> GetByIdAsync(Guid submissionId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            return submission == null ? null : MapToDto(submission);
        }

        public async Task<IEnumerable<SubmissionDto>> GetAllAsync()
        {
            var submissions = await _submissionRepository.GetAllAsync();
            return submissions.Select(MapToDto);
        }

        public async Task<IEnumerable<SubmissionDto>> GetByTeamIdAsync(Guid teamId)
        {
            var submissions = await _submissionRepository.FindAsync(x => x.TeamId == teamId);
            return submissions
                .OrderByDescending(x => x.SubmittedAt)
                .Select(MapToDto);
        }

        public async Task<SubmissionDto?> GetByTeamAndRoundAsync(Guid teamId, Guid roundId)
        {
            var submission = await _submissionRepository.FirstOrDefaultAsync(x => x.TeamId == teamId && x.RoundId == roundId);
            return submission == null ? null : MapToDto(submission);
        }

        public async Task<SubmissionDto> UpdateAsync(UpdateSubmissionRequest request, Guid userId)
        {
            var submission = await _submissionRepository.GetByIdAsync(request.SubmissionId);
            if (submission == null)
                throw new Exception($"Không tìm thấy bài nộp với id: {request.SubmissionId}");

            if (!submission.TeamId.HasValue)
                throw new Exception("Mẫu calibration không thể cập nhật qua endpoint này");

            var updatedTeam = await _teamRepository.GetByIdAsync(submission.TeamId.Value);
            if (updatedTeam == null)
                throw new Exception($"Không tìm thấy đội với id: {submission.TeamId}");

            if (updatedTeam.TeamLeaderId != userId)
                throw new Exception("Chỉ trưởng nhóm mới có thể cập nhật bài nộp.");

            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng thi với id: {submission.RoundId}");

            if (DateTime.UtcNow < round.StartDate)
                throw new Exception($"Vòng thi chưa mở. Bài nộp sẽ được chấp nhận từ {round.StartDate:yyyy-MM-dd HH:mm:ss} UTC.");
            if (DateTime.UtcNow > round.SubmissionDeadline)
                throw new Exception("Đã quá hạn nộp bài. Bạn không thể cập nhật bài nộp này.");

            var oldValue = JsonSerializer.Serialize(new
            {
                submission.RepositoryURL,
                submission.DemoURL,
                submission.SlideURL,
                submission.SubmittedAt,
                submission.Status
            });

            submission.RepositoryURL = request.RepositoryURL?.Trim() ?? string.Empty;
            submission.DemoURL = request.DemoURL?.Trim() ?? string.Empty;
            submission.SlideURL = request.SlideURL?.Trim() ?? string.Empty;
            submission.SubmittedAt = DateTime.UtcNow;
            submission.Status = "Updated";

            var newValue = JsonSerializer.Serialize(new
            {
                submission.RepositoryURL,
                submission.DemoURL,
                submission.SlideURL,
                submission.SubmittedAt,
                submission.Status
            });

            _submissionRepository.Update(submission);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "SUBMISSION_UPDATE",
                OldValue = oldValue,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow
            };
            await _auditLogRepository.AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();
            await _submissionAssetService.AttachAssetsToSubmissionAsync(submission.SubmissionId, submission.TeamId.Value, submission.RoundId, request.VideoAssetId, request.SlideAssetId, userId);
            await NotifyAssignedJudgesAsync(submission.RoundId, $"[NOTIFICATION] Đội thi {updatedTeam.TeamName} đã cập nhật bài dự thi cho vòng {round.RoundName}. Vui lòng kiểm tra lại.");

            return MapToDto(submission);
        }

        public async Task DeleteAsync(Guid submissionId, Guid userId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Không tìm thấy bài nộp với id: {submissionId}");

            if (!submission.TeamId.HasValue)
                throw new Exception("Mẫu calibration không thể xóa qua endpoint này");

            var team = await _teamRepository.GetByIdAsync(submission.TeamId.Value);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {submission.TeamId}");

            if (team.TeamLeaderId != userId)
                throw new Exception("Chỉ trưởng nhóm mới có thể xóa bài nộp.");

            _submissionRepository.Delete(submission);
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task NotifyAssignedJudgesAsync(Guid roundId, string message)
        {
            var assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            var assignments = await assignmentRepository.FindAsync(x => x.RoundId == roundId);
            foreach (var assignment in assignments)
            {
                await _notificationService.CreateNotificationAsync(assignment.UserId, message);
            }
        }

        private static SubmissionDto MapToDto(Submissions submission)
        {
            return new SubmissionDto
            {
                SubmissionId = submission.SubmissionId,
                TeamId = submission.TeamId,
                RoundId = submission.RoundId,
                RepositoryURL = submission.RepositoryURL,
                DemoURL = submission.DemoURL,
                SlideURL = submission.SlideURL,
                SubmittedAt = submission.SubmittedAt,
                Status = submission.Status
            };
        }
    }
}
