using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Rounds
    {
        public Guid RoundId { get; set; }
        public Guid EventId { get; set; }
        public string RoundName { get; set; } = string.Empty;
        public int RoundOrder { get; set; }
        public DateTime SubmissionDeadline { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public virtual Events Event { get; set; } = null!;

        public virtual ICollection<JudgeAssignments> JudgeAssignments { get; set; } = new List<JudgeAssignments>();
        public virtual ICollection<Submissions> Submissions { get; set; } = new List<Submissions>();
        public virtual ICollection<Rankings> Rankings { get; set; } = new List<Rankings>();
        public virtual ICollection<AdvancementRules> AdvancementRules { get; set; } = new List<AdvancementRules>();
    }
}
