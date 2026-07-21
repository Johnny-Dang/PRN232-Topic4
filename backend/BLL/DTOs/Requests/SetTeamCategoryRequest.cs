using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class SetTeamCategoryRequest
    {
        public Guid? CategoryId { get; set; }

        [Required]
        public Guid EventId { get; set; }
    }
}
