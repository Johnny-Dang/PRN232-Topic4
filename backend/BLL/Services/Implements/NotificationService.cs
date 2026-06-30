using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGenericRepository<Notifications> _notificationRepository;
        private readonly INotificationSender _notificationSender;

        public NotificationService(IUnitOfWork unitOfWork, INotificationSender notificationSender)
        {
            _unitOfWork = unitOfWork;
            _notificationRepository = _unitOfWork.GetRepository<Notifications>();
            _notificationSender = notificationSender;
        }

        public async Task<List<NotificationDto>> GetNotificationsForUserAsync(Guid userId)
        {
            var notifications = await _notificationRepository.FindAsync(n => n.UserId == userId);
            return notifications
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new NotificationDto
                {
                    NotificationId = n.NotificationId,
                    UserId = n.UserId,
                    Message = n.Message,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt
                }).ToList();
        }

        public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);
            if (notification == null)
                throw new Exception("Notification not found");

            if (notification.UserId != userId)
                throw new Exception("Unauthorized to modify this notification");

            notification.IsRead = true;
            _notificationRepository.Update(notification);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            var notifications = await _notificationRepository.FindAsync(n => n.UserId == userId && !n.IsRead);
            foreach (var n in notifications)
            {
                n.IsRead = true;
                _notificationRepository.Update(n);
            }
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task CreateNotificationAsync(Guid userId, string message)
        {
            var notification = new Notifications
            {
                NotificationId = Guid.NewGuid(),
                UserId = userId,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _notificationRepository.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            // Send real-time notification via SignalR
            await _notificationSender.SendNotificationToUserAsync(userId, message);
        }
    }
}
