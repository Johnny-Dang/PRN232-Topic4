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
    public class EliminationService : IEliminationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<Eliminations> _eliminationRepository;
        private readonly IGenericRepository<Submissions> _submissionRepository;
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;

        public EliminationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _eliminationRepository = unitOfWork.GetRepository<Eliminations>();
            _submissionRepository = unitOfWork.GetRepository<Submissions>();
            _userRepository = unitOfWork.GetRepository<Users>();
            _auditLogRepository = unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<List<EliminationDto>> GetAllAsync()
        {
            var eliminations = await _eliminationRepository.GetAllWithIncludeAsync(x => x.User, x => x.Submission);

            return eliminations
                .OrderByDescending(x => x.EliminatedAt)
                .Select(x => new EliminationDto
                {
                    EliminationId = x.EliminationId,
                    SubmissionId = x.SubmissionId,
                    UserId = x.UserId,
                    Reason = x.Reason,
                    EliminatedAt = x.EliminatedAt,
                    User = x.User != null ? MapUser(x.User) : null,
                    Submission = x.Submission != null ? MapSubmission(x.Submission) : null
                })
                .ToList();
        }

        public async Task<EliminationDto> CreateEliminationAsync(Guid coordinatorUserId, CreateEliminationDto dto)
        {
            if (dto.SubmissionId == Guid.Empty)
                throw new Exception("Vui lòng chọn bài nộp cần loại.");

            var submission = await _submissionRepository.GetByIdAsync(dto.SubmissionId);
            if (submission == null)
                throw new Exception($"Không tìm thấy bài nộp với id: {dto.SubmissionId}");

            var reason = string.IsNullOrWhiteSpace(dto.Reason) ? "Vi phạm quy chế thi" : dto.Reason.Trim();
            var oldStatus = submission.Status;

            // Update submission status to Disqualified
            submission.Status = "Disqualified";
            _submissionRepository.Update(submission);

            var elimination = new Eliminations
            {
                EliminationId = Guid.NewGuid(),
                SubmissionId = dto.SubmissionId,
                UserId = coordinatorUserId,
                Reason = reason,
                EliminatedAt = DateTime.UtcNow
            };

            await _eliminationRepository.AddAsync(elimination);

            // Audit log
            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = coordinatorUserId,
                ActionType = "SUBMISSION_ELIMINATED",
                OldValue = oldStatus,
                NewValue = JsonSerializer.Serialize(new { Status = "Disqualified", Reason = reason, SubmissionId = dto.SubmissionId }),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();

            var coordinatorUser = await _userRepository.GetByIdAsync(coordinatorUserId);

            return new EliminationDto
            {
                EliminationId = elimination.EliminationId,
                SubmissionId = elimination.SubmissionId,
                UserId = elimination.UserId,
                Reason = elimination.Reason,
                EliminatedAt = elimination.EliminatedAt,
                User = coordinatorUser != null ? MapUser(coordinatorUser) : null,
                Submission = MapSubmission(submission)
            };
        }

        private static UserDto MapUser(Users user)
        {
            return new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                Phone = user.Phone,
                ShortId = user.ShortId,
                Role = user.Role,
                AccountStatus = user.AccountStatus,
                CreatedAt = user.CreatedAt
            };
        }

        private static SubmissionDto MapSubmission(Submissions s)
        {
            return new SubmissionDto
            {
                SubmissionId = s.SubmissionId,
                TeamId = s.TeamId,
                RoundId = s.RoundId,
                RepositoryURL = s.RepositoryURL,
                DemoURL = s.DemoURL,
                SlideURL = s.SlideURL,
                SubmittedAt = s.SubmittedAt,
                Status = s.Status
            };
        }
    }
}
