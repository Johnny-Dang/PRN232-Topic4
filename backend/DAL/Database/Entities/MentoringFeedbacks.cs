using System;

namespace DataAccessLayer.Database.Entities
{
    public class MentoringFeedbacks
    {
        public Guid FeedbackId { get; set; }
        public Guid BookingId { get; set; }
        public Guid TeamId { get; set; }
        public Guid MentorUserId { get; set; }
        public string HealthStatus { get; set; } = "Green"; // Green, Yellow, Red
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual MentorBookings Booking { get; set; } = null!;
        public virtual Teams Team { get; set; } = null!;
        public virtual Users Mentor { get; set; } = null!;
    }
}
