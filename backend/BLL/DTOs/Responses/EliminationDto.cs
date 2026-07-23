using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class EliminationDto
    {
        public Guid EliminationId { get; set; }
        public Guid SubmissionId { get; set; }
        public Guid UserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime EliminatedAt { get; set; }

        public UserDto? User { get; set; }
        public SubmissionDto? Submission { get; set; }
    }
}
