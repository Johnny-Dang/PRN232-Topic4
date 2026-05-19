using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddCategoryMentorRequest
    {
        public Guid CategoryId { get; set; }
        public Guid UserId { get; set; }
    }
}
