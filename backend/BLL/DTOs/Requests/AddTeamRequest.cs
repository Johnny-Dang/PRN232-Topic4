using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddTeamRequest
    {
        public string TeamName { get; set; } = string.Empty;
        public Guid? CategoryId { get; set; }
        public string TeamStatus { get; set; } = "Active";
    }
}
