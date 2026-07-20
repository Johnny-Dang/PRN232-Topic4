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
    public class TeamApplicationController : ControllerBase
    {
        private readonly ITeamApplicationService _applicationService;

        public TeamApplicationController(ITeamApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        [HttpPost("recruitments/{recruitmentId}/apply")]
        public async Task<IActionResult> Apply(Guid recruitmentId, [FromBody] ApplyToTeamRequest request)
        {
            try
            {
                var candidateUserId = GetCurrentUserId();
                var result = await _applicationService.ApplyToTeamAsync(recruitmentId, candidateUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("teams/{teamId}")]
        public async Task<IActionResult> GetByTeam(Guid teamId)
        {
            try
            {
                var leaderUserId = GetCurrentUserId();
                var result = await _applicationService.GetApplicationsByTeamAsync(teamId, leaderUserId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-applications")]
        public async Task<IActionResult> GetMyApplications()
        {
            try
            {
                var candidateUserId = GetCurrentUserId();
                var result = await _applicationService.GetMyApplicationsAsync(candidateUserId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{applicationId}/process")]
        public async Task<IActionResult> ProcessApplication(Guid applicationId, [FromBody] ProcessApplicationRequest request)
        {
            try
            {
                var leaderUserId = GetCurrentUserId();
                var result = await _applicationService.ProcessApplicationAsync(applicationId, leaderUserId, request);
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
