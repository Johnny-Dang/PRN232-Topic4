using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class CategoryMentorDto
    {
        public Guid CategoryMentorId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid UserId { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
