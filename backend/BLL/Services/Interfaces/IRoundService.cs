using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IRoundService
    {
        Task<RoundDto> CreateAsync(Guid eventId, AddRoundRequest request, Guid userId);
        Task<RoundDto?> GetByIdAsync(Guid roundId);
        Task<IEnumerable<RoundDto>> GetAllByEventAsync(Guid eventId);
        Task<RoundDto> UpdateAsync(Guid roundId, AddRoundRequest request);
        Task DeleteAsync(Guid roundId);
    }
}
