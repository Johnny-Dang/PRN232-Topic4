using System;
using System.Collections.Generic;

namespace DataAccessLayer.Database.Entities
{
    public class MentorSchedules
    {
        public Guid ScheduleId { get; set; }
        public Guid MentorUserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? MeetingLocation { get; set; }
        public bool IsBooked { get; set; } = false;

        public virtual Users Mentor { get; set; } = null!;
        public virtual ICollection<MentorBookings> MentorBookings { get; set; } = new List<MentorBookings>();
    }
}
