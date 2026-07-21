using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class SetEventCriteriaRequest
    {
        [Required]
        [MinLength(1)]
        public List<SetEventCriteriaItemRequest> Criteria { get; set; } = new();
    }

    public class SetEventCriteriaItemRequest
    {
        [Required]
        public Guid CriteriaId { get; set; }

        public string? CriteriaName { get; set; }

        [Range(0.01, 100)]
        public decimal Weight { get; set; }
    }
}
