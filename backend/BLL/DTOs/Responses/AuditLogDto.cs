using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class AuditLogDto
    {
        public Guid LogId { get; set; }
        public Guid UserId { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string NewValue { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public UserDto? User { get; set; }
    }
}
