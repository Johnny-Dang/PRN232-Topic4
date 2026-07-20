using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ITeamRecruitmentService
    {
        Task<TeamRecruitmentDto> CreateRecruitmentAsync(Guid teamId, Guid leaderUserId, CreateTeamRecruitmentRequest request);
        Task<List<TeamRecruitmentDto>> GetRecruitmentsAsync(Guid? eventId, Guid? categoryId, string? roleNeeded);
        Task<TeamRecruitmentDto?> GetByIdAsync(Guid recruitmentId);
        Task<List<TeamRecruitmentDto>> GetByTeamIdAsync(Guid teamId);
        Task<TeamRecruitmentDto> CloseRecruitmentAsync(Guid recruitmentId, Guid leaderUserId);
    }
}
