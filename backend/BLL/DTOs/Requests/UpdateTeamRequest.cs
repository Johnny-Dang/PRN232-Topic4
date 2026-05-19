using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateTeamRequest
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid CategoryId { get; set; }
        public string TeamStatus { get; set; } = string.Empty;
    }
}
