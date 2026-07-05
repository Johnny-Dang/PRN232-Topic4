using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class TeamsController : ControllerBase
    {
        private readonly ITeamService _teamService;

        public TeamsController(ITeamService teamService)
        {
            _teamService = teamService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddTeamRequest request)
        {
            try
            {
                var creatorUserId = GetCurrentUserId();
                var result = await _teamService.CreateAsync(creatorUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{teamId}")]
        public async Task<IActionResult> GetById(Guid teamId)
        {
            try
            {
                var result = await _teamService.GetByIdAsync(teamId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _teamService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{teamId}")]
        public async Task<IActionResult> Update(Guid teamId, [FromBody] UpdateTeamRequest request)
        {
            try
            {
                request.TeamId = teamId;
                var result = await _teamService.UpdateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{teamId}/category")]
        public async Task<IActionResult> SetCategory(Guid teamId, [FromBody] SetTeamCategoryRequest request)
        {
            try
            {
                var requesterUserId = GetCurrentUserId();
                var result = await _teamService.SetCategoryAsync(teamId, requesterUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{teamId}")]
        public async Task<IActionResult> Delete(Guid teamId)
        {
            try
            {
                await _teamService.DeleteAsync(teamId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{teamId}/members")]
        public async Task<IActionResult> AddMember(Guid teamId, [FromBody] AddTeamMemberRequest request)
        {
            try
            {
                var requesterUserId = GetCurrentUserId();
                var result = await _teamService.AddMemberAsync(teamId, requesterUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{teamId}/members")]
        public async Task<IActionResult> GetMembers(Guid teamId)
        {
            try
            {
                var result = await _teamService.GetMembersAsync(teamId);
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
