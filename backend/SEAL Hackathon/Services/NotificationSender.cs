using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;
using SEALHackathonSystem.Hubs;
using System;
using System.Threading.Tasks;

namespace SEALHackathonSystem.Services
{
    public class NotificationSender : INotificationSender
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationSender(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendNotificationToUserAsync(Guid userId, string message)
        {
            await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", message);
        }
    }
}
