using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class SubmitScoresRequest
    {
        [Required]
        [MinLength(1)]
        public List<SubmitScoreItemRequest> Scores { get; set; } = new();
    }

    public class SubmitScoreItemRequest
    {
        [Required]
        public Guid CriteriaId { get; set; }

        [Range(0, 100)]
        public decimal ScoreValue { get; set; }

        [StringLength(1000)]
        public string Comment { get; set; } = string.Empty;
    }
}
