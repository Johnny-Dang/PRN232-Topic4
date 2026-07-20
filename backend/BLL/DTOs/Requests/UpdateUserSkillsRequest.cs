using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UserSkillItemRequest
    {
        public string Role { get; set; } = string.Empty;
        public string SkillName { get; set; } = string.Empty;
        public string? ExperienceLevel { get; set; }
    }

    public class UpdateUserSkillsRequest
    {
        public List<UserSkillItemRequest> Skills { get; set; } = new List<UserSkillItemRequest>();
    }
}
