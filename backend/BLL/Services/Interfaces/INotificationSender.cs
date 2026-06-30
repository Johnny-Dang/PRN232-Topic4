using System;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface INotificationSender
    {
        Task SendNotificationToUserAsync(Guid userId, string message);
    }
}
