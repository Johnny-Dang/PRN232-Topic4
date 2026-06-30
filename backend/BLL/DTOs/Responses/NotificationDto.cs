using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class NotificationDto
    {
        public Guid NotificationId { get; set; }
        public Guid UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
