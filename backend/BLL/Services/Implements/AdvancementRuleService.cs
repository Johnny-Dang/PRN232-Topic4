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
            await EnsureRoundIsEditableAsync(request.RoundId);

            var existingRules = (await _advancementRuleRepository.FindAsync(x =>
                x.RoundId == request.RoundId && x.CategoryId == request.CategoryId)).ToList();

            if (existingRules.Any())
            {
                var existingRule = existingRules.First();
                existingRule.TopN = request.TopN;
                _advancementRuleRepository.Update(existingRule);

                foreach (var duplicateRule in existingRules.Skip(1))
                {
                    _advancementRuleRepository.Delete(duplicateRule);
                }

                await _unitOfWork.SaveChangesAsync();
                return MapToDto(existingRule);
            }

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
                throw new Exception($"Không tìm thấy quy tắc thăng hạng với id: {request.RuleId}");

            await EnsureRoundIsEditableAsync(rule.RoundId);
            await ValidateForeignKeysAsync(request.RoundId, request.CategoryId);
            await EnsureRoundIsEditableAsync(request.RoundId);

            var duplicateRules = await _advancementRuleRepository.FindAsync(x =>
                x.RuleId != request.RuleId &&
                x.RoundId == request.RoundId &&
                x.CategoryId == request.CategoryId);

            foreach (var duplicateRule in duplicateRules)
            {
                _advancementRuleRepository.Delete(duplicateRule);
            }

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
                throw new Exception($"Không tìm thấy quy tắc thăng hạng với id: {ruleId}");

            await EnsureRoundIsEditableAsync(rule.RoundId);
            _advancementRuleRepository.Delete(rule);
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task EnsureRoundIsEditableAsync(Guid roundId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round?.IsFinalized == true)
                throw new Exception("Quy tắc của round đã chốt không thể sửa hoặc xóa.");
        }

        private async Task ValidateForeignKeysAsync(Guid roundId, Guid categoryId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng với id: {roundId}");

            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
                throw new Exception($"Không tìm thấy danh mục với id: {categoryId}");

            if (category.EventId != round.EventId)
                throw new Exception("Danh mục không thuộc về sự kiện của vòng đã chọn");
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
