using DataAccessLayer.Database.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IRoundEligibilityService
    {
        Task EnsureTeamCanParticipateAsync(
            Guid teamId,
            Rounds targetRound,
            CancellationToken cancellationToken = default);
        Task<(bool IsEligible, string? Reason)> CheckTeamCanParticipateAsync(
            Guid teamId,
            Rounds targetRound,
            CancellationToken cancellationToken = default);
    }
}
