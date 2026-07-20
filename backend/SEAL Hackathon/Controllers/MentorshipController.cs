using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MentorshipController : ControllerBase
    {
        private readonly IMentorshipService _mentorshipService;

        public MentorshipController(IMentorshipService mentorshipService)
        {
            _mentorshipService = mentorshipService;
        }

        // Mentor: Create schedule slot
        [HttpPost("schedules")]
        [Authorize(Roles = "Mentor")]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateScheduleDto dto)
        {
            try
            {
                var mentorUserId = GetCurrentUserId();
                var result = await _mentorshipService.CreateScheduleAsync(mentorUserId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mentor: Get my schedule slots
        [HttpGet("schedules/my-schedules")]
        [Authorize(Roles = "Mentor")]
        public async Task<IActionResult> GetMySchedules()
        {
            try
            {
                var mentorUserId = GetCurrentUserId();
                var result = await _mentorshipService.GetMentorSchedulesAsync(mentorUserId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mentor: Delete unbooked schedule slot
        [HttpDelete("schedules/{scheduleId}")]
        [Authorize(Roles = "Mentor")]
        public async Task<IActionResult> DeleteSchedule(Guid scheduleId)
        {
            try
            {
                var mentorUserId = GetCurrentUserId();
                await _mentorshipService.DeleteScheduleAsync(mentorUserId, scheduleId);
                return Ok(new { message = "Schedule deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Team Leader: Get available schedules for category
        [HttpGet("schedules/available")]
        public async Task<IActionResult> GetAvailableSchedules([FromQuery] Guid categoryId)
        {
            try
            {
                var result = await _mentorshipService.GetAvailableSchedulesForCategoryAsync(categoryId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Team Leader: Book mentoring slot
        [HttpPost("bookings")]
        public async Task<IActionResult> BookMentoring([FromBody] CreateBookingDto dto)
        {
            try
            {
                var leaderUserId = GetCurrentUserId();
                var result = await _mentorshipService.BookMentoringAsync(leaderUserId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // User (Mentor or Leader or Coordinator): Get my bookings
        [HttpGet("bookings/my-bookings")]
        public async Task<IActionResult> GetMyBookings()
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();
                var result = await _mentorshipService.GetMyBookingsAsync(userId, userRole);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mentor: Update booking status (ACCEPT, REJECT, RESCHEDULE, COMPLETE)
        [HttpPut("bookings/{bookingId}/status")]
        [Authorize(Roles = "Mentor")]
        public async Task<IActionResult> UpdateBookingStatus(Guid bookingId, [FromBody] UpdateBookingStatusDto dto)
        {
            try
            {
                var mentorUserId = GetCurrentUserId();
                var result = await _mentorshipService.UpdateBookingStatusAsync(mentorUserId, bookingId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mentor: Submit Checkpoint feedback & update team health status
        [HttpPost("feedbacks")]
        [Authorize(Roles = "Mentor")]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto dto)
        {
            try
            {
                var mentorUserId = GetCurrentUserId();
                var result = await _mentorshipService.CreateFeedbackAsync(mentorUserId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Get feedbacks for a team
        [HttpGet("feedbacks/team/{teamId}")]
        public async Task<IActionResult> GetTeamFeedbacks(Guid teamId)
        {
            try
            {
                var result = await _mentorshipService.GetTeamFeedbacksAsync(teamId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Coordinator: Health Overview Dashboard
        [HttpGet("coordinator/dashboard")]
        public async Task<IActionResult> GetCoordinatorHealthOverview([FromQuery] Guid? eventId)
        {
            try
            {
                var result = await _mentorshipService.GetCoordinatorHealthOverviewAsync(eventId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
                throw new Exception("Invalid user token");

            return userId;
        }

        private string GetCurrentUserRole()
        {
            return User.FindFirstValue(ClaimTypes.Role) ?? "Student";
        }
    }
}
