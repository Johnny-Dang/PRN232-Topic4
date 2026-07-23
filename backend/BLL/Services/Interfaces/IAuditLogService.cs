using BusinessLogicLayer.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IAuditLogService
    {
        Task<List<AuditLogDto>> GetAllAsync();
    }
}
