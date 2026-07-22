using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class EventCriteriaService : IEventCriteriaService
    {
        private readonly IGenericRepository<EventCriteria> _eventCriteriaRepository;
        private readonly IGenericRepository<Events> _eventRepository;
        private readonly IGenericRepository<Criteria> _criteriaRepository;
        private readonly IGenericRepository<AuditLogs> _auditLogRepository;
        private readonly IUnitOfWork _unitOfWork;

        public EventCriteriaService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _eventCriteriaRepository = _unitOfWork.GetRepository<EventCriteria>();
            _eventRepository = _unitOfWork.GetRepository<Events>();
            _criteriaRepository = _unitOfWork.GetRepository<Criteria>();
            _auditLogRepository = _unitOfWork.GetRepository<AuditLogs>();
        }

        public async Task<IEnumerable<EventCriteriaDto>> SetForEventAsync(Guid eventId, SetEventCriteriaRequest request, Guid userId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Không tìm thấy sự kiện với id: {eventId}");

            var duplicateCriteria = request.Criteria
                .GroupBy(x => x.CriteriaId)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToList();

            if (duplicateCriteria.Any())
                throw new Exception("Phát hiện tiêu chí trùng lặp trong yêu cầu");

            var existingEventCriteria = await _eventCriteriaRepository.FindAsync(x => x.EventId == eventId);
            var requestedCriteriaIds = request.Criteria.Select(x => x.CriteriaId).ToHashSet();
            var removedEventCriteria = existingEventCriteria
                .Where(x => !requestedCriteriaIds.Contains(x.CriteriaId))
                .ToList();

            foreach (var removed in removedEventCriteria)
            {
                _eventCriteriaRepository.Delete(removed);
            }

            var templateRepo = _unitOfWork.GetRepository<SubmissionTemplates>();
            var defaultTemplate = (await templateRepo.GetAllAsync()).FirstOrDefault();
            if (defaultTemplate == null)
            {
                defaultTemplate = new SubmissionTemplates
                {
                    TemplateId = Guid.NewGuid(),
                    TemplateName = "Default Event Submission Template",
                    Description = "Auto-generated template for event criteria"
                };
                await templateRepo.AddAsync(defaultTemplate);
            }

            foreach (var item in request.Criteria)
            {
                var normalizedWeight = item.Weight > 1 ? item.Weight / 100m : item.Weight;

                var criteria = await _criteriaRepository.GetByIdAsync(item.CriteriaId);
                if (criteria == null)
                {
                    criteria = new Criteria
                    {
                        CriteriaId = item.CriteriaId,
                        TemplateId = defaultTemplate.TemplateId,
                        CriteriaName = string.IsNullOrWhiteSpace(item.CriteriaName) ? "Tiêu chí mới" : item.CriteriaName.Trim(),
                        Weight = normalizedWeight
                    };
                    await _criteriaRepository.AddAsync(criteria);
                }
                else
                {
                    if (!string.IsNullOrWhiteSpace(item.CriteriaName))
                    {
                        criteria.CriteriaName = item.CriteriaName.Trim();
                    }
                    criteria.Weight = normalizedWeight;
                    _criteriaRepository.Update(criteria);
                }

                var existing = existingEventCriteria.FirstOrDefault(x => x.CriteriaId == item.CriteriaId);
                if (existing == null)
                {
                    await _eventCriteriaRepository.AddAsync(new EventCriteria
                    {
                        EventCriteriaId = Guid.NewGuid(),
                        EventId = eventId,
                        CriteriaId = item.CriteriaId,
                        Weight = normalizedWeight
                    });

                    continue;
                }

                existing.Weight = normalizedWeight;
                _eventCriteriaRepository.Update(existing);
            }

            await _auditLogRepository.AddAsync(new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "EVENT_CRITERIA_SET",
                OldValue = JsonSerializer.Serialize(existingEventCriteria.Select(x => new
                {
                    x.EventCriteriaId,
                    x.EventId,
                    x.CriteriaId,
                    x.Weight
                })),
                NewValue = JsonSerializer.Serialize(new
                {
                    EventId = eventId,
                    request.Criteria
                }),
                CreatedAt = DateTime.UtcNow
            });

            await _unitOfWork.SaveChangesAsync();
            return await GetByEventAsync(eventId);
        }

        public async Task<IEnumerable<EventCriteriaDto>> GetByEventAsync(Guid eventId)
        {
            var eventCriteria = await _eventCriteriaRepository.FindAsync(x => x.EventId == eventId);
            var criteriaIds = eventCriteria.Select(x => x.CriteriaId).Distinct().ToList();
            var criteria = await _criteriaRepository.FindAsync(x => criteriaIds.Contains(x.CriteriaId));
            var criteriaById = criteria.ToDictionary(x => x.CriteriaId, x => x);

            return eventCriteria
                .OrderBy(x => x.CriteriaId)
                .Select(x =>
                {
                    criteriaById.TryGetValue(x.CriteriaId, out var criteriaEntity);

                    return new EventCriteriaDto
                    {
                        EventCriteriaId = x.EventCriteriaId,
                        EventId = x.EventId,
                        CriteriaId = x.CriteriaId,
                        CriteriaName = criteriaEntity?.CriteriaName ?? string.Empty,
                        Weight = x.Weight
                    };
                });
        }
    }
}
