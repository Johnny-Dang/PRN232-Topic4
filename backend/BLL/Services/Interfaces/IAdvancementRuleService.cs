using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IAdvancementRuleService
    {
        Task<AdvancementRuleDto> CreateAsync(AddAdvancementRuleRequest request);
        Task<AdvancementRuleDto?> GetByIdAsync(Guid ruleId);
        Task<List<AdvancementRuleDto>> GetAllAsync();
        Task<AdvancementRuleDto> UpdateAsync(UpdateAdvancementRuleRequest request);
        Task DeleteAsync(Guid ruleId);
    }
}
