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
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;

        public SubmissionService(IUnitOfWork unitOfWork, INotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _notificationService = notificationService;
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<SubmissionDto> CreateAsync(AddSubmissionRequest request, Guid userId)
        {
            var team = await _teamRepository.GetByIdAsync(request.TeamId);
            if (team == null)
                throw new Exception($"Team with id {request.TeamId} not found");

            if (team.TeamLeaderId != userId)
                throw new Exception("Only the team leader can submit the project.");

            var round = await _roundRepository.GetByIdAsync(request.RoundId);
            if (round == null)
                throw new Exception($"Round with id {request.RoundId} not found");

            var now = DateTime.UtcNow;
            if (now > round.SubmissionDeadline)
                throw new Exception("Submission deadline has passed. You cannot create a new submission.");

            var existingSubmission = await _submissionRepository.FirstOrDefaultAsync(x => x.TeamId == request.TeamId && x.RoundId == request.RoundId);
            if (existingSubmission != null)
                throw new Exception("This team already has a submission for this round. Use update instead.");

            var submission = new Submissions
            {
                SubmissionId = Guid.NewGuid(),
                TeamId = request.TeamId,
                RoundId = request.RoundId,
                RepositoryURL = request.RepositoryURL,
                DemoURL = request.DemoURL,
                SlideURL = request.SlideURL,
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

            var assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            var assignments = await assignmentRepository.FindAsync(x => x.RoundId == request.RoundId);
            foreach (var assignment in assignments)
            {
                var msg = $"[NOTIFICATION] Đội thi {team.TeamName} đã nộp bài dự thi cho vòng {round.RoundName}. Vui lòng truy cập để chấm điểm.";
                await _notificationService.CreateNotificationAsync(assignment.UserId, msg);
            }

            return MapToDto(created);
        }

        public async Task<SubmissionDto?> GetByIdAsync(Guid submissionId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null) return null;
            return MapToDto(submission);
        }

        public async Task<IEnumerable<SubmissionDto>> GetAllAsync()
        {
            var submissions = await _submissionRepository.GetAllAsync();
            return submissions.Select(MapToDto);
        }

        public async Task<SubmissionDto> UpdateAsync(UpdateSubmissionRequest request, Guid userId)
        {
            var submission = await _submissionRepository.GetByIdAsync(request.SubmissionId);
            if (submission == null)
                throw new Exception($"Submission with id {request.SubmissionId} not found");

            var updatedTeam = await _teamRepository.GetByIdAsync(submission.TeamId);
            if (updatedTeam == null)
                throw new Exception($"Team with id {submission.TeamId} not found");

            if (updatedTeam.TeamLeaderId != userId)
                throw new Exception("Only the team leader can update the submission.");

            var round = await _roundRepository.GetByIdAsync(submission.RoundId);
            if (round == null)
                throw new Exception($"Round with id {submission.RoundId} not found");

            if (DateTime.UtcNow > round.SubmissionDeadline)
                throw new Exception("Submission deadline has passed. You cannot update this submission.");

            var oldValue = JsonSerializer.Serialize(new
            {
                submission.RepositoryURL,
                submission.DemoURL,
                submission.SlideURL,
                submission.SubmittedAt,
                submission.Status
            });

            submission.RepositoryURL = request.RepositoryURL;
            submission.DemoURL = request.DemoURL;
            submission.SlideURL = request.SlideURL;
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

            var assignmentRepository = _unitOfWork.GetRepository<JudgeAssignments>();
            var assignments = await assignmentRepository.FindAsync(x => x.RoundId == submission.RoundId);
            foreach (var assignment in assignments)
            {
                var msg = $"[NOTIFICATION] Đội thi {updatedTeam.TeamName} đã cập nhật bài dự thi cho vòng {round.RoundName}. Vui lòng kiểm tra lại.";
                await _notificationService.CreateNotificationAsync(assignment.UserId, msg);
            }

            return MapToDto(submission);
        }

        public async Task DeleteAsync(Guid submissionId)
        {
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Submission with id {submissionId} not found");

            _submissionRepository.Delete(submission);
            await _unitOfWork.SaveChangesAsync();
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
