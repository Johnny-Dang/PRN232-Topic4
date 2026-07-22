using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class JudgeSubmissionDto
    {
        public Guid SubmissionId { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid RoundId { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid? CategoryId { get; set; }
        public string RepositoryURL { get; set; } = string.Empty;
        public string DemoURL { get; set; } = string.Empty;
        public string SlideURL { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<ScoreDto> Scores { get; set; } = new();
        public List<SubmissionAssetDto> Assets { get; set; } = new();
    }
}
