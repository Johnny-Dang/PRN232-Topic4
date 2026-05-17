using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class SubmissionTemplates
    {
        public Guid TemplateId { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public virtual ICollection<Criteria> Criteria { get; set; } = new List<Criteria>();
    }
}
