using System;

namespace DataAccessLayer.Database.Entities
{
    public class EventParticipants
    {
        public Guid EventParticipantId { get; set; }
        public Guid EventId { get; set; }
        public Guid UserId { get; set; }
        public DateTime RegisteredAt { get; set; }
        public string Status { get; set; } = "Registered";

        public virtual Events Event { get; set; } = null!;
        public virtual Users User { get; set; } = null!;
    }
}
