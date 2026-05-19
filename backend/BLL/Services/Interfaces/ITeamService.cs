using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ITeamService
    {
        Task<TeamDto> CreateAsync(Guid creatorUserId, AddTeamRequest request);
        Task<TeamDto?> GetByIdAsync(Guid teamId);
        Task<List<TeamDto>> GetAllAsync();
        Task<TeamDto> UpdateAsync(UpdateTeamRequest request);
        Task<TeamDto> SetCategoryAsync(Guid teamId, Guid requesterUserId, SetTeamCategoryRequest request);
        Task DeleteAsync(Guid teamId);
        Task<TeamDto> AddMemberAsync(Guid teamId, Guid requesterUserId, AddTeamMemberRequest request);
    }
}
