using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IMentorshipService
    {
        // Mentor Schedule Management
        Task<MentorScheduleDto> CreateScheduleAsync(Guid mentorUserId, CreateScheduleDto dto);
        Task<List<MentorScheduleDto>> GetMentorSchedulesAsync(Guid mentorUserId);
        Task<bool> DeleteScheduleAsync(Guid mentorUserId, Guid scheduleId);
        Task<List<MentorScheduleDto>> GetAvailableSchedulesForCategoryAsync(Guid categoryId);

        // Mentoring Bookings
        Task<MentorBookingDto> BookMentoringAsync(Guid teamLeaderUserId, CreateBookingDto dto);
        Task<List<MentorBookingDto>> GetMyBookingsAsync(Guid userId, string userRole);
        Task<MentorBookingDto> UpdateBookingStatusAsync(Guid mentorUserId, Guid bookingId, UpdateBookingStatusDto dto);

        // Feedback & Checkpoints
        Task<MentoringFeedbackDto> CreateFeedbackAsync(Guid mentorUserId, CreateFeedbackDto dto);
        Task<List<MentoringFeedbackDto>> GetTeamFeedbacksAsync(Guid teamId);

        // Coordinator Dashboard Overview
        Task<CoordinatorHealthOverviewDto> GetCoordinatorHealthOverviewAsync(Guid? eventId = null);
    }
}
