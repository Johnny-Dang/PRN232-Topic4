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
    public class SubmissionsController : ControllerBase
    {
        private readonly ISubmissionService _submissionService;

        public SubmissionsController(ISubmissionService submissionService)
        {
            _submissionService = submissionService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddSubmissionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _submissionService.CreateAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{submissionId}")]
        public async Task<IActionResult> GetById(Guid submissionId)
        {
            try
            {
                var result = await _submissionService.GetByIdAsync(submissionId);
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
                var result = await _submissionService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateSubmissionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _submissionService.UpdateAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{submissionId}")]
        public async Task<IActionResult> Delete(Guid submissionId)
        {
            try
            {
                await _submissionService.DeleteAsync(submissionId);
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
