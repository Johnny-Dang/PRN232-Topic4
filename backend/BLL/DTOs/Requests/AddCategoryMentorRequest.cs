using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddCategoryMentorRequest
    {
        [Required]
        public Guid CategoryId { get; set; }

        [Required]
        public Guid UserId { get; set; }
    }
}
