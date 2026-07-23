using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ITeamRoundProgressService
    {
        Task<IReadOnlyList<TeamRoundProgressDto>> GetAsync(
            Guid teamId,
            Guid requesterUserId,
            CancellationToken cancellationToken = default);
    }
}
