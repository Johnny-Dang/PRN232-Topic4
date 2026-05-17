using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class JudgeAssignments
    {
        public Guid AssignmentId { get; set; }
        public Guid UserId { get; set; }
        public Guid RoundId { get; set; }

        public virtual Users User { get; set; } = null!;
        public virtual Rounds Round { get; set; } = null!;
    }
}
