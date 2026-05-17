using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Eliminations
    {
        public Guid EliminationId { get; set; }
        public Guid SubmissionId { get; set; }
        public Guid UserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime EliminatedAt { get; set; }

        public virtual Submissions Submission { get; set; } = null!;
        public virtual Users User { get; set; } = null!;
    }
}
