using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateTeamRequest
    {
        [Required]
        public Guid TeamId { get; set; }

        [Required]
        [StringLength(120, MinimumLength = 2)]
        public string TeamName { get; set; } = string.Empty;

        public Guid? EventId { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        [StringLength(30)]
        public string TeamStatus { get; set; } = string.Empty;
    }
}
