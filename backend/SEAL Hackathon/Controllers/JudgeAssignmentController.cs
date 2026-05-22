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
    public class JudgeAssignmentController : ControllerBase
    {
        private readonly IJudgeAssignmentService _judgeAssignmentService;

        public JudgeAssignmentController(IJudgeAssignmentService judgeAssignmentService)
        {
            _judgeAssignmentService = judgeAssignmentService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddJudgeAssignmentRequest request)
        {
            try
            {
                var result = await _judgeAssignmentService.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{assignmentId}")]
        public async Task<IActionResult> GetById(Guid assignmentId)
        {
            try
            {
                var result = await _judgeAssignmentService.GetByIdAsync(assignmentId);
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
                var result = await _judgeAssignmentService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateJudgeAssignmentRequest request)
        {
            try
            {
                var result = await _judgeAssignmentService.UpdateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{assignmentId}")]
        public async Task<IActionResult> Delete(Guid assignmentId)
        {
            try
            {
                await _judgeAssignmentService.DeleteAsync(assignmentId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
