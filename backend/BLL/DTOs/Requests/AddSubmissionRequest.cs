using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddSubmissionRequest
    {
        public Guid TeamId { get; set; }
        public Guid RoundId { get; set; }
        public string RepositoryURL { get; set; } = string.Empty;
        public string DemoURL { get; set; } = string.Empty;
        public string SlideURL { get; set; } = string.Empty;
    }
}
