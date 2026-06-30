using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class CategoryMentors
    {
        public Guid CategoryMentorId { get; set; }
        public Guid CategoryId { get; set; }
        public Guid UserId { get; set; }
        public string Status { get; set; } = "Pending";

        public virtual Categories Category { get; set; } = null!;
        public virtual Users User { get; set; } = null!;
    }
}
