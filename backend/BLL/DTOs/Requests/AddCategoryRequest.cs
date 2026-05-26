using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddCategoryRequest
    {
        [Required]
        public Guid EventId { get; set; }

        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string CategoryName { get; set; } = string.Empty;

        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;
    }
}
