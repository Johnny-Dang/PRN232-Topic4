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
    [Route("api/[controller]")]
    public class TeamRecruitmentController : ControllerBase
    {
        private readonly ITeamRecruitmentService _recruitmentService;

        public TeamRecruitmentController(ITeamRecruitmentService recruitmentService)
        {
            _recruitmentService = recruitmentService;
        }

        [HttpPost("teams/{teamId}")]
        public async Task<IActionResult> CreateRecruitment(Guid teamId, [FromBody] CreateTeamRecruitmentRequest request)
        {
            try
            {
                var leaderUserId = GetCurrentUserId();
                var result = await _recruitmentService.CreateRecruitmentAsync(teamId, leaderUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetRecruitments([FromQuery] Guid? eventId, [FromQuery] Guid? categoryId, [FromQuery] string? roleNeeded)
        {
            try
            {
                var result = await _recruitmentService.GetRecruitmentsAsync(eventId, categoryId, roleNeeded);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{recruitmentId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid recruitmentId)
        {
            try
            {
                var result = await _recruitmentService.GetByIdAsync(recruitmentId);
                if (result == null)
                    return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("teams/{teamId}")]
        public async Task<IActionResult> GetByTeamId(Guid teamId)
        {
            try
            {
                var result = await _recruitmentService.GetByTeamIdAsync(teamId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{recruitmentId}/close")]
        public async Task<IActionResult> CloseRecruitment(Guid recruitmentId)
        {
            try
            {
                var leaderUserId = GetCurrentUserId();
                var result = await _recruitmentService.CloseRecruitmentAsync(recruitmentId, leaderUserId);
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
