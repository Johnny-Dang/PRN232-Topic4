using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ITeamApplicationService
    {
        Task<TeamApplicationDto> ApplyToTeamAsync(Guid recruitmentId, Guid candidateUserId, ApplyToTeamRequest request);
        Task<List<TeamApplicationDto>> GetApplicationsByTeamAsync(Guid teamId, Guid leaderUserId);
        Task<List<TeamApplicationDto>> GetMyApplicationsAsync(Guid candidateUserId);
        Task<TeamApplicationDto> ProcessApplicationAsync(Guid applicationId, Guid leaderUserId, ProcessApplicationRequest request);
    }
}
