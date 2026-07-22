using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class CalibrationController : ControllerBase
    {
        private readonly ICalibrationService _calibrationService;

        public CalibrationController(ICalibrationService calibrationService)
        {
            _calibrationService = calibrationService;
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpPost("submissions")]
        public async Task<IActionResult> CreateSampleSubmission([FromBody] CreateCalibrationSubmissionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _calibrationService.CreateSampleSubmissionAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = innerMessage });
            }
        }

        [Authorize(Policy = "CalibrationViewer")]
        [HttpGet("submissions")]
        public async Task<IActionResult> GetSampleSubmissions([FromQuery] Guid? eventId, [FromQuery] string? status)
        {
            try
            {
                var result = await _calibrationService.GetSampleSubmissionsAsync(eventId, status);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CalibrationViewer")]
        [HttpGet("submissions/{submissionId}")]
        public async Task<IActionResult> GetSampleSubmission(Guid submissionId)
        {
            try
            {
                var result = await _calibrationService.GetSampleSubmissionByIdAsync(submissionId);
                if (result == null)
                    return NotFound(new { message = "Calibration submission not found" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CalibrationViewer")]
        [HttpGet("submissions/{submissionId}/scores")]
        public async Task<IActionResult> GetScores(Guid submissionId)
        {
            try
            {
                var allScores = await _calibrationService.GetScoresAsync(submissionId);
                
                var myScore = new List<CalibrationScoreDto>();
                try
                {
                    var judgeUserId = GetCurrentUserId();
                    var (_, scores) = await _calibrationService.GetMyScoresAsync(submissionId, judgeUserId);
                    myScore = scores.ToList();
                }
                catch
                {
                    // User is not a judge, skip myScore
                }
                
                return Ok(new { scores = allScores, myScore = myScore });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "JudgeOnly")]
        [HttpGet("submissions/{submissionId}/my-score")]
        public async Task<IActionResult> GetMyScore(Guid submissionId)
        {
            try
            {
                var judgeUserId = GetCurrentUserId();
                var (hasScored, scores) = await _calibrationService.GetMyScoresAsync(submissionId, judgeUserId);
                return Ok(new { hasScored, scores });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "JudgeOnly")]
        [HttpPost("submissions/{submissionId}/scores")]
        public async Task<IActionResult> SubmitScores(Guid submissionId, [FromBody] SubmitScoresRequest request)
        {
            try
            {
                var judgeUserId = GetCurrentUserId();
                var result = await _calibrationService.SubmitScoresAsync(submissionId, judgeUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "JudgeOnly")]
        [HttpPut("submissions/{submissionId}/scores")]
        public async Task<IActionResult> UpdateScores(Guid submissionId, [FromBody] SubmitScoresRequest request)
        {
            try
            {
                var judgeUserId = GetCurrentUserId();
                var result = await _calibrationService.UpdateScoresAsync(submissionId, judgeUserId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "ResearcherOrCoordinator")]
        [HttpGet("submissions/{submissionId}/analysis")]
        public async Task<IActionResult> GetAnalysis(Guid submissionId)
        {
            try
            {
                var result = await _calibrationService.GetAnalysisAsync(submissionId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "ResearcherOrCoordinator")]
        [HttpGet("submissions/{submissionId}/export")]
        public async Task<IActionResult> ExportDataset(Guid submissionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var csv = await _calibrationService.ExportDatasetCsvAsync(submissionId, userId);
                var fileName = $"calibration-{submissionId}.csv";
                return File(Encoding.UTF8.GetBytes(csv), "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpDelete("submissions/{submissionId}")]
        public async Task<IActionResult> DeleteSampleSubmission(Guid submissionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _calibrationService.DeleteSampleSubmissionAsync(submissionId, userId);
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
