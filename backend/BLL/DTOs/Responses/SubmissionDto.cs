using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class SubmissionDto
    {
        public Guid SubmissionId { get; set; }
        public Guid TeamId { get; set; }
        public Guid RoundId { get; set; }
        public string RepositoryURL { get; set; } = string.Empty;
        public string DemoURL { get; set; } = string.Empty;
        public string SlideURL { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
