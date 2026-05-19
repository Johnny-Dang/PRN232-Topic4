using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class CategoryDto
    {
        public Guid CategoryId { get; set; }
        public Guid EventId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
