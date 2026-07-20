using System;

namespace DataAccessLayer.Database.Entities
{
    public class UserSkills
    {
        public Guid UserSkillId { get; set; }
        public Guid UserId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string SkillName { get; set; } = string.Empty;
        public string? ExperienceLevel { get; set; }
        public DateTime CreatedAt { get; set; }

        public virtual Users User { get; set; } = null!;
    }
}
