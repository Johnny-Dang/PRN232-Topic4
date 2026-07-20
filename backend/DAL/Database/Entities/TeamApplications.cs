using System;

namespace DataAccessLayer.Database.Entities
{
    public class TeamApplications
    {
        public Guid ApplicationId { get; set; }
        public Guid RecruitmentId { get; set; }
        public Guid TeamId { get; set; }
        public Guid UserId { get; set; } // Candidate / Solo Student
        public string Message { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING"; // PENDING, ACCEPTED, REJECTED, CANCELLED
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual TeamRecruitments Recruitment { get; set; } = null!;
        public virtual Teams Team { get; set; } = null!;
        public virtual Users User { get; set; } = null!;
    }
}
