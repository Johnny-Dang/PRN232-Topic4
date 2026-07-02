using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class EventCriteriaDto
    {
        public Guid EventCriteriaId { get; set; }
        public Guid EventId { get; set; }
        public Guid CriteriaId { get; set; }
        public string CriteriaName { get; set; } = string.Empty;
        public decimal Weight { get; set; }
    }
}
