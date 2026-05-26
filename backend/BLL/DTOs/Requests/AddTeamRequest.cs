using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddTeamRequest
    {
        [Required]
        [StringLength(120, MinimumLength = 2)]
        public string TeamName { get; set; } = string.Empty;

        public Guid? CategoryId { get; set; }

        [Required]
        [StringLength(30)]
        public string TeamStatus { get; set; } = "Active";
    }
}
