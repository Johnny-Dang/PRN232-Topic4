using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Scores
    {
        public Guid ScoreId { get; set; }
        public Guid SubmissionId { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid CriteriaId { get; set; }
        public decimal ScoreValue { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime ScoredAt { get; set; }

        public virtual Submissions Submission { get; set; } = null!;
        public virtual JudgeAssignments JudgeAssignment { get; set; } = null!;
        public virtual Criteria Criteria { get; set; } = null!;
    }
}
