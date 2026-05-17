using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class AdvancementRules
    {
        public Guid RuleId { get; set; }
        public Guid RoundId { get; set; }
        public Guid CategoryId { get; set; }
        public int TopN { get; set; }

        public virtual Rounds Round { get; set; } = null!;
        public virtual Categories Category { get; set; } = null!;
    }
}
