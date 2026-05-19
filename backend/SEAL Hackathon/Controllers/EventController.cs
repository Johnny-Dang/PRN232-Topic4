using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet("{eventId}")]
        public async Task<IActionResult> GetEventById(Guid eventId)
        {
            try
            {
                var result = await _eventService.GetEventByIdAsync(eventId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _eventService.GetAllEventAsync();
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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
        /// Update an event
        /// </summary>
        [HttpPut("{eventId}")]
        public async Task<IActionResult> UpdateEvent(Guid eventId, [FromBody] UpdateEventRequest request)
        {
            try
            {
                request.EventId = eventId;
                var result = await _eventService.UpdateAsync(request);
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
