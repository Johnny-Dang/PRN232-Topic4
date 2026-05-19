using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        /// <summary>
        /// Create a new event
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request)
        {
            try
            {
                var result = await _eventService.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Add a round to an event
        /// </summary>
        [HttpPost("{eventId}/rounds")]
        public async Task<IActionResult> AddRound(Guid eventId, [FromBody] AddRoundRequest request)
        {
            try
            {
                var result = await _eventService.AddRoundForEventAsync(eventId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove a round from an event
        /// </summary>
        [HttpDelete("{eventId}/rounds/{roundId}")]
        public async Task<IActionResult> RemoveRound(Guid eventId, Guid roundId)
        {
            try
            {
                var result = await _eventService.RemoveRoundForEventAsync(eventId, roundId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
