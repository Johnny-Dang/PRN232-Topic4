using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class CalibrationScores
    {
        public Guid CalibrationScoreId { get; set; }
        public Guid JudgeId { get; set; }
        public Guid CriteriaId { get; set; }
        public Guid SubmissionId { get; set; }
        public decimal ScoreValue { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime ScoredAt { get; set; }

        public virtual Users Judge { get; set; } = null!;
        public virtual Criteria Criteria { get; set; } = null!;
        public virtual Submissions Submission { get; set; } = null!;
    }
}
