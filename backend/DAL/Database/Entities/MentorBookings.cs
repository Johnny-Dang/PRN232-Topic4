using System;
using System.Collections.Generic;

namespace DataAccessLayer.Database.Entities
{
    public class MentorBookings
    {
        public Guid BookingId { get; set; }
        public Guid ScheduleId { get; set; }
        public Guid TeamId { get; set; }
        public Guid MentorUserId { get; set; }
        public string Objective { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING"; // PENDING, ACCEPTED, REJECTED, RESCHEDULED, COMPLETED, CANCELLED
        public string? MeetingLink { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual MentorSchedules Schedule { get; set; } = null!;
        public virtual Teams Team { get; set; } = null!;
        public virtual Users Mentor { get; set; } = null!;
        public virtual ICollection<MentoringFeedbacks> Feedbacks { get; set; } = new List<MentoringFeedbacks>();
    }
}
