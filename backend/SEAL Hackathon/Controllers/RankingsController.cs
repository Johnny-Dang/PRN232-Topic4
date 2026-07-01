using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Authorize(Policy = "JudgeOrCoordinator")]
    [Route("api/[controller]")]
    public class RankingsController : ControllerBase
    {
        private readonly IRankingService _rankingService;

        public RankingsController(IRankingService rankingService)
        {
            _rankingService = rankingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetByRound([FromQuery] Guid roundId, [FromQuery] Guid? categoryId)
        {
            try
            {
                var result = await _rankingService.GetByRoundAsync(roundId, categoryId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpPost("generate/{roundId}")]
        public async Task<IActionResult> Generate(Guid roundId)
        {
            try
            {
                var result = await _rankingService.GenerateAsync(roundId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [Authorize(Policy = "CoordinatorOnly")]
        [HttpPost("apply-advancement/{roundId}")]
        public async Task<IActionResult> ApplyAdvancement(Guid roundId)
        {
            try
            {
                var result = await _rankingService.ApplyAdvancementRulesAsync(roundId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
