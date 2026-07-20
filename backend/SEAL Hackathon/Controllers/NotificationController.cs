using System;
using System.Collections.Generic;
using System.Linq;
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

    // Request để tạo notification cho nhiều user
    public class CreateBulkNotificationRequest
    {
        public string? Message { get; set; }
        public List<Guid>? UserIds { get; set; }
        public string? TargetRole { get; set; } // Gửi cho tất cả user có role này
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

        // Endpoint để Admin tạo notification cho user cụ thể hoặc theo role
        [HttpPost("create")]
        [Authorize(Roles = "Coordinator,EventCoordinator")]
        public async Task<IActionResult> CreateBulkNotification([FromBody] CreateBulkNotificationRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                    return BadRequest(new { message = "Message is required" });

                if ((request.UserIds == null || !request.UserIds.Any()) && string.IsNullOrWhiteSpace(request.TargetRole))
                    return BadRequest(new { message = "Must specify either UserIds or TargetRole" });

                var userIds = new List<Guid>();

                // Nếu có UserIds cụ thể
                if (request.UserIds != null && request.UserIds.Any())
                {
                    userIds.AddRange(request.UserIds);
                }

                // Đánh dấu notification là từ Admin/Coordinator
                var message = $"[ADMIN] {request.Message}";

                // Gửi notification cho tất cả user ids
                if (userIds.Any())
                {
                    await _notificationService.CreateNotificationForUsersAsync(userIds, message);
                }

                return Ok(new { 
                    message = "Notifications sent successfully", 
                    recipientCount = userIds.Count,
                    targetRole = request.TargetRole
                });
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
