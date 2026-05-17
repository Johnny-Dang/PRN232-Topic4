using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class EventCriteria
    {
        public Guid EventCriteriaId { get; set; }
        public Guid CriteriaId { get; set; }
        public Guid EventId { get; set; }
        public decimal Weight { get; set; }

        public virtual Criteria Criteria { get; set; } = null!;
        public virtual Events Event { get; set; } = null!;
    }
}
