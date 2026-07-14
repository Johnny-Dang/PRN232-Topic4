using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class CreateCalibrationSubmissionRequest
    {
        public Guid? TeamId { get; set; }

        [Required]
        public Guid RoundId { get; set; }

        [Required]
        [StringLength(255, MinimumLength = 2)]
        public string CalibrationTitle { get; set; } = string.Empty;

        [Url]
        [StringLength(500)]
        public string? RepositoryURL { get; set; }

        [Url]
        [StringLength(500)]
        public string? DemoURL { get; set; }

        [Url]
        [StringLength(500)]
        public string? SlideURL { get; set; }
    }
}
