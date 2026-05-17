using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class StudentProfiles
    {
        public Guid ProfileId { get; set; }
        public Guid UserId { get; set; }
        public string StudentType { get; set; } = string.Empty;
        public string StudentCode { get; set; } = string.Empty;
        public string UniversityName { get; set; } = string.Empty;

        public virtual Users User { get; set; } = null!;
    }
}
