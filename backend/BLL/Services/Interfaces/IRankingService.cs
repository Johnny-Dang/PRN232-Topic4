using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IRankingService
    {
        Task<IEnumerable<RankingDto>> GenerateAsync(Guid roundId);
        Task<IEnumerable<RankingDto>> GetByRoundAsync(Guid roundId, Guid? categoryId = null);
        Task<IEnumerable<RankingDto>> ApplyAdvancementRulesAsync(Guid roundId);
    }
}
