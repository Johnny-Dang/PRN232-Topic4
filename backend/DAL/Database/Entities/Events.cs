using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Events
    {
        public Guid EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string Season { get; set; } = string.Empty;
        public int Year { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public virtual ICollection<Categories> Categories { get; set; } = new List<Categories>();
        public virtual ICollection<Rounds> Rounds { get; set; } = new List<Rounds>();
        public virtual ICollection<EventCriteria> EventCriteria { get; set; } = new List<EventCriteria>();
    }
}
