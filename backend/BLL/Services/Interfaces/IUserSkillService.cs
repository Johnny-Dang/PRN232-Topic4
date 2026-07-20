using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IUserSkillService
    {
        Task<List<UserSkillDto>> UpdateUserSkillsAsync(Guid userId, UpdateUserSkillsRequest request);
        Task<List<UserSkillDto>> GetUserSkillsAsync(Guid userId);
    }
}
