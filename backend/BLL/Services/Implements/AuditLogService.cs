using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;

        public AuditLogService(IUnitOfWork unitOfWork)
        {
            _auditLogRepository = unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<List<AuditLogDto>> GetAllAsync()
        {
            var logs = await _auditLogRepository.GetAllWithIncludeAsync(x => x.User);

            return logs
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new AuditLogDto
                {
                    LogId = x.LogId,
                    UserId = x.UserId,
                    ActionType = x.ActionType,
                    OldValue = x.OldValue,
                    NewValue = x.NewValue,
                    CreatedAt = x.CreatedAt,
                    User = x.User != null ? new UserDto
                    {
                        UserId = x.User.UserId,
                        Email = x.User.Email,
                        FullName = x.User.FullName,
                        Phone = x.User.Phone,
                        ShortId = x.User.ShortId,
                        Role = x.User.Role,
                        AccountStatus = x.User.AccountStatus,
                        CreatedAt = x.User.CreatedAt
                    } : null
                })
                .ToList();
        }
    }
}
