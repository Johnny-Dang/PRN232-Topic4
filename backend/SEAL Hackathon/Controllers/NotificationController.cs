using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SEALHackathonSystem.Controllers
{
    public class CreateTestNotificationRequest
    {
        public string? Message { get; set; }
    }

    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _notificationService.GetNotificationsForUserAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid notificationId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.MarkAsReadAsync(notificationId, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                await _notificationService.MarkAllAsReadAsync(userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Test endpoint - tạo notification thử nghiệm
        [HttpPost("test")]
        public async Task<IActionResult> CreateTestNotification([FromBody] CreateTestNotificationRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var message = string.IsNullOrWhiteSpace(request.Message)
                    ? $"[NOTIFICATION] Đây là thông báo test lúc {DateTime.Now:HH:mm:ss}"
                    : $"[NOTIFICATION] {request.Message}";
                await _notificationService.CreateNotificationAsync(userId, message);
                return Ok(new { message = "Test notification created", userId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (
                string.IsNullOrWhiteSpace(userIdClaim)
                || !Guid.TryParse(userIdClaim, out var userId)
            )
                throw new Exception("Invalid user token");

            return userId;
        }
    }
}
