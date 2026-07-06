using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Formats.Asn1.AsnWriter;

namespace DataAccessLayer.Database.Entities
{
    public class Submissions
    {
        public Guid SubmissionId { get; set; }
        public Guid TeamId { get; set; }
        public Guid RoundId { get; set; }
        public string RepositoryURL { get; set; } = string.Empty;
        public string DemoURL { get; set; } = string.Empty;
        public string SlideURL { get; set; } = string.Empty;
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsCalibrationSample { get; set; }
        public string CalibrationTitle { get; set; } = string.Empty;

        public virtual Teams Team { get; set; } = null!;
        public virtual Rounds Round { get; set; } = null!;

        public virtual ICollection<Scores> Scores { get; set; } = new List<Scores>();
        public virtual ICollection<CalibrationScores> CalibrationScores { get; set; } = new List<CalibrationScores>();
        public virtual ICollection<Eliminations> Eliminations { get; set; } = new List<Eliminations>();
        public virtual ICollection<SubmissionAssets> SubmissionAssets { get; set; } = new List<SubmissionAssets>();
    }
}
