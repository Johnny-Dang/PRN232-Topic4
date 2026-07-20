using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class CategoryMentorDetailDto
    {
        public Guid CategoryMentorId { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string MentorFullName { get; set; } = string.Empty;
        public string MentorEmail { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
    }
}
