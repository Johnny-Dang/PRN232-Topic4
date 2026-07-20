using System;
using System.Collections.Generic;

namespace DataAccessLayer.Database.Entities
{
    public class TeamRecruitments
    {
        public Guid RecruitmentId { get; set; }
        public Guid TeamId { get; set; }
        public string RoleNeeded { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public string Status { get; set; } = "OPEN"; // OPEN, CLOSED, CANCELLED
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual Teams Team { get; set; } = null!;
        public virtual ICollection<TeamApplications> Applications { get; set; } = new List<TeamApplications>();
    }
}
