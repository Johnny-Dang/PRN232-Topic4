using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateJudgeAssignmentRequest
    {
        [Required]
        public Guid AssignmentId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid RoundId { get; set; }
    }
}
