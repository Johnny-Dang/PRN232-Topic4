using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class AuditLogs
    {
        public Guid LogId { get; set; }
        public Guid UserId { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string? OldValue { get; set; } = string.Empty;
        public string NewValue { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public virtual Users User { get; set; } = null!;
    }
}
