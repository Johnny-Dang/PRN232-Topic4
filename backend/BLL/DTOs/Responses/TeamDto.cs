using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class TeamDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid TeamLeaderId { get; set; }
        public Guid? EventId { get; set; }
        public Guid? CategoryId { get; set; }
        public string TeamStatus { get; set; } = string.Empty;
    }
}
