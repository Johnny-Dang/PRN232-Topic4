using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateSubmissionRequest
    {
        public Guid SubmissionId { get; set; }
        public string RepositoryURL { get; set; } = string.Empty;
        public string DemoURL { get; set; } = string.Empty;
        public string SlideURL { get; set; } = string.Empty;
    }
}
