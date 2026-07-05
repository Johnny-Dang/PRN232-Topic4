using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class TeamMemberDetailDto
    {
        public Guid TeamMemberId { get; set; }
        public Guid TeamId { get; set; }
        public Guid UserId { get; set; }
        public DateTime JoinDate { get; set; }
        public UserDto User { get; set; } = null!;
        public StudentProfileDto? StudentProfile { get; set; }
    }

    public class StudentProfileDto
    {
        public Guid ProfileId { get; set; }
        public Guid UserId { get; set; }
        public string StudentType { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string UniversityName { get; set; } = string.Empty;
    }
}
