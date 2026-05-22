using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class JudgeAssignmentDto
    {
        public Guid AssignmentId { get; set; }
        public Guid UserId { get; set; }
        public Guid RoundId { get; set; }
    }
}
