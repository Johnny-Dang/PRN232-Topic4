using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace SEALHackathonSystem.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
    }
}
