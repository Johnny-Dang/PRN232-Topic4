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
    public class UserSkillsController : ControllerBase
    {
        private readonly IUserSkillService _userSkillService;

        public UserSkillsController(IUserSkillService userSkillService)
        {
            _userSkillService = userSkillService;
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSkills([FromBody] UpdateUserSkillsRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _userSkillService.UpdateUserSkillsAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-skills")]
        public async Task<IActionResult> GetMySkills()
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _userSkillService.GetUserSkillsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserSkills(Guid userId)
        {
            try
            {
                var result = await _userSkillService.GetUserSkillsAsync(userId);
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
