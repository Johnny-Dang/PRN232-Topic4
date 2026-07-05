using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class MentorCategoryDto
    {
        public Guid CategoryId { get; set; }
        public Guid EventId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string EventName { get; set; } = string.Empty;
        public string AssignmentStatus { get; set; } = string.Empty;
    }

    public class MentorTeamDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid TeamLeaderId { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string TeamStatus { get; set; } = string.Empty;
    }

    public class MentorSubmissionDto
    {
        public Guid SubmissionId { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public Guid RoundId { get; set; }
        public string RoundName { get; set; } = string.Empty;
        public string RepositoryURL { get; set; } = string.Empty;
        public string DemoURL { get; set; } = string.Empty;
        public string SlideURL { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
