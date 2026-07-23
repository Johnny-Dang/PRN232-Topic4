using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Security.Claims;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class RoundController : ControllerBase
    {
        private readonly IRoundService _roundService;
        private readonly IRoundFinalizationService _roundFinalizationService;

        public RoundController(
            IRoundService roundService,
            IRoundFinalizationService roundFinalizationService)
        {
            _roundService = roundService;
            _roundFinalizationService = roundFinalizationService;
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpPost("/api/Rounds/{roundId}/finalize")]
        public async Task<IActionResult> FinalizeRound(Guid roundId)
        {
            try
            {
                return Ok(await _roundFinalizationService.FinalizeRoundAsync(roundId));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpPost("events/{eventId}")]
        public async Task<IActionResult> CreateRound(Guid eventId, [FromBody] AddRoundRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _roundService.CreateAsync(eventId, request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{roundId}")]
        public async Task<IActionResult> GetById(Guid roundId)
        {
            try
            {
                var result = await _roundService.GetByIdAsync(roundId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("events/{eventId}")]
        public async Task<IActionResult> GetAllByEvent(Guid eventId)
        {
            try
            {
                var result = await _roundService.GetAllByEventAsync(eventId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpPut("{roundId}")]
        public async Task<IActionResult> UpdateRound(Guid roundId, [FromBody] AddRoundRequest request)
        {
            try
            {
                var result = await _roundService.UpdateAsync(roundId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpDelete("{roundId}")]
        public async Task<IActionResult> DeleteRound(Guid roundId)
        {
            try
            {
                await _roundService.DeleteAsync(roundId);
                return NoContent();
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
