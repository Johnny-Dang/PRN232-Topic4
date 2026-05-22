using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddScoreRequest request)
        {
            try
            {
                var result = await _scoresService.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{scoreId}")]
        public async Task<IActionResult> GetById(Guid scoreId)
        {
            try
            {
                var result = await _scoresService.GetByIdAsync(scoreId);
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
                var result = await _scoresService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateScoreRequest request)
        {
            try
            {
                var result = await _scoresService.UpdateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{scoreId}")]
        public async Task<IActionResult> Delete(Guid scoreId)
        {
            try
            {
                await _scoresService.DeleteAsync(scoreId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
