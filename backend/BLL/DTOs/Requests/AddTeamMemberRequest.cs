using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddTeamMemberRequest
    {
        [Required]
        public Guid UserId { get; set; }
    }
}
