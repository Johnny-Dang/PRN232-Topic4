using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class SubmissionDto
    {
        public Guid SubmissionId { get; set; }
        public Guid? TeamId { get; set; }
        public Guid RoundId { get; set; }
        public string? RepositoryURL { get; set; }
        public string? DemoURL { get; set; }
        public string? SlideURL { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
