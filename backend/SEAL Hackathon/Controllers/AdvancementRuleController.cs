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
    public class AdvancementRuleController : ControllerBase
    {
        private readonly IAdvancementRuleService _advancementRuleService;

        public AdvancementRuleController(IAdvancementRuleService advancementRuleService)
        {
            _advancementRuleService = advancementRuleService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AddAdvancementRuleRequest request)
        {
            try
            {
                var result = await _advancementRuleService.CreateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{ruleId}")]
        public async Task<IActionResult> GetById(Guid ruleId)
        {
            try
            {
                var result = await _advancementRuleService.GetByIdAsync(ruleId);
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
                var result = await _advancementRuleService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{ruleId}")]
        public async Task<IActionResult> Update(Guid ruleId, [FromBody] UpdateAdvancementRuleRequest request)
        {
            try
            {
                request.RuleId = ruleId;
                var result = await _advancementRuleService.UpdateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{ruleId}")]
        public async Task<IActionResult> Delete(Guid ruleId)
        {
            try
            {
                await _advancementRuleService.DeleteAsync(ruleId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
