using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class RoundEligibilityService : IRoundEligibilityService
    {
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Rankings> _rankingRepository;

        public RoundEligibilityService(IUnitOfWork unitOfWork)
        {
            _roundRepository = unitOfWork.GetRepository<Rounds>();
            _rankingRepository = unitOfWork.GetRepository<Rankings>();
        }

        public async Task EnsureTeamCanParticipateAsync(
            Guid teamId,
            Rounds targetRound,
            CancellationToken cancellationToken = default)
        {
            var result = await CheckTeamCanParticipateAsync(teamId, targetRound, cancellationToken);
            if (!result.IsEligible)
                throw new Exception(result.Reason);
        }

        public async Task<(bool IsEligible, string? Reason)> CheckTeamCanParticipateAsync(
            Guid teamId,
            Rounds targetRound,
            CancellationToken cancellationToken = default)
        {
            var priorRounds = await _roundRepository.FindAsync(
                round => round.EventId == targetRound.EventId
                    && round.RoundOrder < targetRound.RoundOrder,
                cancellationToken);

            var previousRound = priorRounds
                .OrderByDescending(round => round.RoundOrder)
                .FirstOrDefault();

            if (previousRound == null)
                return (true, null);

            if (!previousRound.IsFinalized)
            {
                return (
                    false,
                    $"Vòng trước ({previousRound.RoundName}) chưa được chốt. Đội chưa thể tham gia vòng này.");
            }

            var ranking = await _rankingRepository.FirstOrDefaultAsync(
                item => item.RoundId == previousRound.RoundId && item.TeamId == teamId,
                cancellationToken);

            if (ranking?.IsAdvanced != true)
            {
                return (
                    false,
                    $"Đội không được thăng hạng từ {previousRound.RoundName} nên không thể tham gia vòng này.");
            }

            return (true, null);
        }
    }
}
