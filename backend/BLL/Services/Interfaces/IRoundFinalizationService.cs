using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IRoundFinalizationService
    {
        Task<int> FinalizeDueRoundsAsync(CancellationToken cancellationToken = default);
        Task<RoundFinalizationDto> FinalizeRoundAsync(
            Guid roundId,
            CancellationToken cancellationToken = default);
    }
}
