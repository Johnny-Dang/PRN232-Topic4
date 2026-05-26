using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddJudgeAssignmentRequest
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid RoundId { get; set; }
    }
}
