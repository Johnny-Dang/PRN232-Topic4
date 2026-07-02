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
    [Authorize]
    [Route("api/events/{eventId}/criteria")]
    public class EventCriteriaController : ControllerBase
    {
        private readonly IEventCriteriaService _eventCriteriaService;

        public EventCriteriaController(IEventCriteriaService eventCriteriaService)
        {
            _eventCriteriaService = eventCriteriaService;
        }

        [HttpGet]
        public async Task<IActionResult> GetByEvent(Guid eventId)
        {
            try
            {
                var result = await _eventCriteriaService.GetByEventAsync(eventId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpPost]
        public async Task<IActionResult> SetForEvent(Guid eventId, [FromBody] SetEventCriteriaRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _eventCriteriaService.SetForEventAsync(eventId, request, userId);
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
    }
}
