using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddCategoryRequest
    {
        public Guid EventId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
