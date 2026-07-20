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
    public class ScoresController : ControllerBase
    {
        private readonly IScoresService _scoresService;

        public ScoresController(IScoresService scoresService)
        {
            _scoresService = scoresService;
        }

        [Authorize(Policy = "JudgeOnly")]
        [HttpGet("assigned-submissions")]
        public async Task<IActionResult> GetAssignedSubmissions()
        {
            try
            {
                var judgeUserId = GetCurrentUserId();
                var result = await _scoresService.GetAssignedSubmissionsAsync(judgeUserId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "TeamScoreViewer")]
        [HttpGet("submissions/{submissionId}")]
        public async Task<IActionResult> GetScoresBySubmission(Guid submissionId)
        {
            try
            {
                var viewerUserId = GetCurrentUserId();
                var result = await _scoresService.GetScoresBySubmissionForTeamAsync(submissionId, viewerUserId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "JudgeOnly")]
        [HttpPost("submissions/{submissionId}")]
        public async Task<IActionResult> SubmitForSubmission(Guid submissionId, [FromBody] SubmitScoresRequest request)
        {
            try
            {
                var judgeUserId = GetCurrentUserId();
                var result = await _scoresService.SubmitForSubmissionAsync(submissionId, judgeUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "JudgeOnly")]
        [HttpPut("submissions/{submissionId}")]
        public async Task<IActionResult> UpdateForSubmission(Guid submissionId, [FromBody] SubmitScoresRequest request)
        {
            try
            {
                var judgeUserId = GetCurrentUserId();
                var result = await _scoresService.UpdateForSubmissionAsync(submissionId, judgeUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private Guid GetCurrentUserId()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdValue) || !Guid.TryParse(userIdValue, out var userId))
                throw new Exception("Authenticated user id is missing or invalid");

            return userId;
        }
    }
}
