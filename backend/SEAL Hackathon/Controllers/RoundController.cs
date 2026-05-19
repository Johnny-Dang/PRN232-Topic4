using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoundController : ControllerBase
    {
        private readonly IRoundService _roundService;

        public RoundController(IRoundService roundService)
        {
            _roundService = roundService;
        }

        [HttpPost("events/{eventId}")]
        public async Task<IActionResult> CreateRound(Guid eventId, [FromBody] AddRoundRequest request)
        {
            try
            {
                var result = await _roundService.CreateAsync(eventId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{roundId}")]
        public async Task<IActionResult> GetById(Guid roundId)
        {
            try
            {
                var result = await _roundService.GetByIdAsync(roundId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("events/{eventId}")]
        public async Task<IActionResult> GetAllByEvent(Guid eventId)
        {
            try
            {
                var result = await _roundService.GetAllByEventAsync(eventId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{roundId}")]
        public async Task<IActionResult> UpdateRound(Guid roundId, [FromBody] AddRoundRequest request)
        {
            try
            {
                var result = await _roundService.UpdateAsync(roundId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{roundId}")]
        public async Task<IActionResult> DeleteRound(Guid roundId)
        {
            try
            {
                await _roundService.DeleteAsync(roundId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
