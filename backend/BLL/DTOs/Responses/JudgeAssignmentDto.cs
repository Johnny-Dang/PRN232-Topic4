using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class JudgeAssignmentDto
    {
        public Guid AssignmentId { get; set; }
        public Guid UserId { get; set; }
        public string UserFullName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public Guid RoundId { get; set; }
    }
}
