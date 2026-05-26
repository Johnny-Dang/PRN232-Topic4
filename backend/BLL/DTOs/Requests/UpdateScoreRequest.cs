using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateScoreRequest
    {
        [Required]
        public Guid ScoreId { get; set; }

        [Required]
        public Guid SubmissionId { get; set; }

        [Required]
        public Guid AssignmentId { get; set; }

        [Required]
        public Guid CriteriaId { get; set; }

        [Range(0, 100)]
        public decimal ScoreValue { get; set; }

        [StringLength(1000)]
        public string Comment { get; set; } = string.Empty;
    }
}
