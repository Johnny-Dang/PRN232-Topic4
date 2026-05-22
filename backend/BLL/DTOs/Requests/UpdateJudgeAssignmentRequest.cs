using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateJudgeAssignmentRequest
    {
        public Guid AssignmentId { get; set; }
        public Guid UserId { get; set; }
        public Guid RoundId { get; set; }
    }
}
