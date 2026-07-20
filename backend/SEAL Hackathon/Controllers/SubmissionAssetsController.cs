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
    public class SubmissionAssetsController : ControllerBase
    {
        private readonly ISubmissionAssetService _submissionAssetService;

        public SubmissionAssetsController(ISubmissionAssetService submissionAssetService)
        {
            _submissionAssetService = submissionAssetService;
        }

        [HttpPost("sign-upload")]
        public async Task<IActionResult> SignUpload([FromBody] SignSubmissionAssetUploadRequest request)
        {
            try
            {
                var result = await _submissionAssetService.SignUploadAsync(request, GetCurrentUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("complete")]
        public async Task<IActionResult> CompleteUpload([FromBody] CompleteSubmissionAssetUploadRequest request)
        {
            try
            {
                var result = await _submissionAssetService.CompleteUploadAsync(request, GetCurrentUserId());
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("submission/{submissionId}")]
        public async Task<IActionResult> GetBySubmissionId(Guid submissionId)
        {
            try
            {
                var result = await _submissionAssetService.GetBySubmissionIdAsync(submissionId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("team/{teamId}/round/{roundId}")]
        public async Task<IActionResult> GetByTeamAndRound(Guid teamId, Guid roundId)
        {
            try
            {
                var result = await _submissionAssetService.GetByTeamAndRoundAsync(teamId, roundId);
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
