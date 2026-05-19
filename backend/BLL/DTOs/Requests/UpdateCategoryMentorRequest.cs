using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateCategoryMentorRequest
    {
        public Guid CategoryMentorId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid UserId { get; set; }
    }
}
