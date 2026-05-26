using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateAdvancementRuleRequest
    {
        [Required]
        public Guid RuleId { get; set; }

        [Required]
        public Guid RoundId { get; set; }

        [Required]
        public Guid CategoryId { get; set; }

        [Range(1, 100)]
        public int TopN { get; set; }
    }
}
