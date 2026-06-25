using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class AdvancementRuleService : IAdvancementRuleService
    {
        private readonly IGenericRepository<AdvancementRules> _advancementRuleRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Categories> _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public AdvancementRuleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _advancementRuleRepository = _unitOfWork.GetRepository<AdvancementRules>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _categoryRepository = _unitOfWork.GetRepository<Categories>();
        }

        public async Task<AdvancementRuleDto> CreateAsync(AddAdvancementRuleRequest request, Guid userId)
        {
            await ValidateForeignKeysAsync(request.RoundId, request.CategoryId);

            var rule = new AdvancementRules
            {
                RuleId = Guid.NewGuid(),
                RoundId = request.RoundId,
                CategoryId = request.CategoryId,
                TopN = request.TopN
            };

            var created = await _advancementRuleRepository.AddAsync(rule);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "ADVANCEMENT_RULE_CREATE",
                OldValue = null,
                NewValue = System.Text.Json.JsonSerializer.Serialize(new
                {
                    created.RuleId,
                    created.RoundId,
                    created.CategoryId,
                    created.TopN
                }),
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(created);
        }

        public async Task<AdvancementRuleDto?> GetByIdAsync(Guid ruleId)
        {
            var rule = await _advancementRuleRepository.GetByIdAsync(ruleId);
            if (rule == null) return null;
            return MapToDto(rule);
        }

        public async Task<List<AdvancementRuleDto>> GetAllAsync()
        {
            var rules = await _advancementRuleRepository.GetAllAsync();
            return rules.Select(MapToDto).ToList();
        }

        public async Task<AdvancementRuleDto> UpdateAsync(UpdateAdvancementRuleRequest request)
        {
            var rule = await _advancementRuleRepository.GetByIdAsync(request.RuleId);
            if (rule == null)
                throw new Exception($"AdvancementRule with id {request.RuleId} not found");

            await ValidateForeignKeysAsync(request.RoundId, request.CategoryId);

            rule.RoundId = request.RoundId;
            rule.CategoryId = request.CategoryId;
            rule.TopN = request.TopN;

            _advancementRuleRepository.Update(rule);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(rule);
        }

        public async Task DeleteAsync(Guid ruleId)
        {
            var rule = await _advancementRuleRepository.GetByIdAsync(ruleId);
            if (rule == null)
                throw new Exception($"AdvancementRule with id {ruleId} not found");

            _advancementRuleRepository.Delete(rule);
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task ValidateForeignKeysAsync(Guid roundId, Guid categoryId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");

            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Category with id {categoryId} not found");
        }

        private static AdvancementRuleDto MapToDto(AdvancementRules rule)
        {
            return new AdvancementRuleDto
            {
                RuleId = rule.RuleId,
                RoundId = rule.RoundId,
                CategoryId = rule.CategoryId,
                TopN = rule.TopN
            };
        }
    }
}
