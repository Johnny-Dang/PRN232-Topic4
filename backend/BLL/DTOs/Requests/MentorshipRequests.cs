using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class CreateScheduleDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? MeetingLocation { get; set; }
    }

    public class CreateBookingDto
    {
        public Guid ScheduleId { get; set; }
        public string Objective { get; set; } = string.Empty;
    }

    public class UpdateBookingStatusDto
    {
        public string Status { get; set; } = string.Empty; // ACCEPTED, REJECTED, RESCHEDULED, COMPLETED, CANCELLED
        public string? MeetingLink { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateFeedbackDto
    {
        public Guid BookingId { get; set; }
        public string HealthStatus { get; set; } = "Green"; // Green, Yellow, Red
        public string Content { get; set; } = string.Empty;
    }
}
