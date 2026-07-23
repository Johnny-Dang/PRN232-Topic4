using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class CreateEliminationDto
    {
        public Guid SubmissionId { get; set; }
        public string Reason { get; set; } = string.Empty;
    }
}
