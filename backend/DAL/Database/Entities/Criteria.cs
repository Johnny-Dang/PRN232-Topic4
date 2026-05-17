using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Formats.Asn1.AsnWriter;

namespace DataAccessLayer.Database.Entities
{
    public class Criteria
    {
        public Guid CriteriaId { get; set; }
        public Guid TemplateId { get; set; }
        public string CriteriaName { get; set; } = string.Empty;
        public decimal Weight { get; set; }

        public virtual SubmissionTemplates Template { get; set; } = null!;

        public virtual ICollection<EventCriteria> EventCriteria { get; set; } = new List<EventCriteria>();
        public virtual ICollection<Scores> Scores { get; set; } = new List<Scores>();
        public virtual ICollection<CalibrationScores> CalibrationScores { get; set; } = new List<CalibrationScores>();
    }
}
