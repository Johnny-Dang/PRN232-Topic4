using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Categories
    {
        public Guid CategoryId { get; set; }
        public Guid EventId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public virtual Events Event { get; set; } = null!;

        public virtual ICollection<Teams> Teams { get; set; } = new List<Teams>();
        public virtual ICollection<CategoryMentors> CategoryMentors { get; set; } = new List<CategoryMentors>();
        public virtual ICollection<AdvancementRules> AdvancementRules { get; set; } = new List<AdvancementRules>();
    }
}
