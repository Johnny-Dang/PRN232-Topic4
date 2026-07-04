using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class EventDto
    {
        public Guid EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string Season { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public DateTime? PublishedAt { get; set; }
        public Guid? PublishedBy { get; set; }
        public bool IsFeatured { get; set; }
        public string BannerUrl { get; set; } = string.Empty;
        public string Organizer { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public string Prize { get; set; } = string.Empty;

        public IEnumerable<RoundDto> Rounds { get; set; } = new List<RoundDto>();
    }
}
