using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Teams
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid TeamLeaderId { get; set; }
        public Guid? CategoryId { get; set; }
        public string TeamStatus { get; set; } = string.Empty;

        public virtual Users TeamLeader { get; set; } = null!;
        public virtual Categories? Category { get; set; }

        public virtual ICollection<TeamMembers> TeamMembers { get; set; } = new List<TeamMembers>();
        public virtual ICollection<Submissions> Submissions { get; set; } = new List<Submissions>();
        public virtual ICollection<Rankings> Rankings { get; set; } = new List<Rankings>();
    }
}
