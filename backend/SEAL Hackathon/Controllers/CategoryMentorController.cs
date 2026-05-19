using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;

namespace SEALHackathonSystem.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class CategoryMentorController : ControllerBase
    {
        private readonly ICategoryMentorService _categoryMentorService;

        public CategoryMentorController(ICategoryMentorService categoryMentorService)
        {
            _categoryMentorService = categoryMentorService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddCategoryMentorRequest request)
        {
            try
            {
                var result = await _categoryMentorService.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{categoryMentorId}")]
        public async Task<IActionResult> GetById(Guid categoryMentorId)
        {
            try
            {
                var result = await _categoryMentorService.GetByIdAsync(categoryMentorId);
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
                var result = await _categoryMentorService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{categoryMentorId}")]
        public async Task<IActionResult> Update(Guid categoryMentorId, [FromBody] UpdateCategoryMentorRequest request)
        {
            try
            {
                request.CategoryMentorId = categoryMentorId;
                var result = await _categoryMentorService.UpdateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{categoryMentorId}")]
        public async Task<IActionResult> Delete(Guid categoryMentorId)
        {
            try
            {
                await _categoryMentorService.DeleteAsync(categoryMentorId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
