using BusinessLogicLayer.Services.Interfaces;

namespace SEALHackathonSystem.Services
{
    public class RoundFinalizationWorker : BackgroundService
    {
        private static readonly TimeSpan Interval = TimeSpan.FromMinutes(1);
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<RoundFinalizationWorker> _logger;

        public RoundFinalizationWorker(
            IServiceScopeFactory scopeFactory,
            ILogger<RoundFinalizationWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await FinalizeDueRoundsAsync(stoppingToken);
            using var timer = new PeriodicTimer(Interval);

            while (await timer.WaitForNextTickAsync(stoppingToken))
                await FinalizeDueRoundsAsync(stoppingToken);
        }

        private async Task FinalizeDueRoundsAsync(CancellationToken cancellationToken)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var service = scope.ServiceProvider.GetRequiredService<IRoundFinalizationService>();
                var finalizedCount = await service.FinalizeDueRoundsAsync(cancellationToken);
                if (finalizedCount > 0)
                    _logger.LogInformation("Đã tự động chốt {Count} round.", finalizedCount);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, "Lỗi khi chạy worker chốt round.");
            }
        }
    }
}
