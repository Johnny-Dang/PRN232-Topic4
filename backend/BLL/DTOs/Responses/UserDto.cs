using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class UserDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string AccountStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
