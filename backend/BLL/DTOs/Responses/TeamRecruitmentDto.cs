using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class TeamRecruitmentDto
    {
        public Guid RecruitmentId { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid? EventId { get; set; }
        public Guid? CategoryId { get; set; }
        public string RoleNeeded { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
