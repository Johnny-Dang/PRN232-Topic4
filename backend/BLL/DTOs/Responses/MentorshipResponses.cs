using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class MentorScheduleDto
    {
        public Guid ScheduleId { get; set; }
        public Guid MentorUserId { get; set; }
        public string MentorName { get; set; } = string.Empty;
        public string MentorEmail { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string? MeetingLocation { get; set; }
        public bool IsBooked { get; set; }
    }

    public class MentorBookingDto
    {
        public Guid BookingId { get; set; }
        public Guid ScheduleId { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid MentorUserId { get; set; }
        public string MentorName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Objective { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? MeetingLink { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MentoringFeedbackDto
    {
        public Guid FeedbackId { get; set; }
        public Guid BookingId { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid MentorUserId { get; set; }
        public string MentorName { get; set; } = string.Empty;
        public string HealthStatus { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class TeamHealthSummaryDto
    {
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid? EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public Guid? CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string TeamLeaderName { get; set; } = string.Empty;
        public string HealthStatus { get; set; } = "Green";
        public int TotalBookings { get; set; }
        public DateTime? LastMentoredAt { get; set; }
        public string? LastFeedbackContent { get; set; }
    }

    public class CoordinatorHealthOverviewDto
    {
        public int TotalTeams { get; set; }
        public int GreenTeamsCount { get; set; }
        public int YellowTeamsCount { get; set; }
        public int RedTeamsCount { get; set; }
        public int ZeroBookingsCount { get; set; }
        public List<TeamHealthSummaryDto> Teams { get; set; } = new();
    }
}
