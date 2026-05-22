using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddJudgeAssignmentRequest
    {
        public Guid UserId { get; set; }
        public Guid RoundId { get; set; }
    }
}
