using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class TeamMembers
    {
        public Guid TeamMemberId { get; set; }
        public Guid TeamId { get; set; }
        public Guid UserId { get; set; }
        public DateTime JoinDate { get; set; }

        // Navigation
        public virtual Users User { get; set; } = null!;
        public virtual Teams Team { get; set; } = null!;
    }
}
