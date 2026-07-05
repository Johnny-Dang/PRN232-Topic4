using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddTeamMemberRequest
    {
        public Guid? UserId { get; set; }
        public string? Email { get; set; }
        public string? ShortId { get; set; }
    }
}
