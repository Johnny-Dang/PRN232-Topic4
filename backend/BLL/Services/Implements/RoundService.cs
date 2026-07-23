using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Utilities;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class RoundService : IRoundService
    {
        private readonly IRoundRepository _roundRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IUnitOfWork _unitOfWork;

        public RoundService(IRoundRepository roundRepository, IEventRepository eventRepository, IUnitOfWork unitOfWork)
        {
            _roundRepository = roundRepository;
            _eventRepository = eventRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<RoundDto> CreateAsync(Guid eventId, AddRoundRequest request, Guid userId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Không tìm thấy sự kiện với id: {eventId}");

            var round = new Rounds
            {
                RoundId = Guid.NewGuid(),
                EventId = eventId,
                RoundName = request.RoundName,
                RoundOrder = request.RoundOrder,
                SubmissionDeadline = request.SubmissionDeadline,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };

            var created = await _roundRepository.AddAsync(round);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "ROUND_CREATE",
                OldValue = null,
                NewValue = System.Text.Json.JsonSerializer.Serialize(new
                {
                    created.RoundId,
                    created.EventId,
                    created.RoundName,
                    created.RoundOrder,
                    created.SubmissionDeadline,
                    created.StartDate,
                    created.EndDate
                }),
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

            await _unitOfWork.SaveChangesAsync();

            return MapToDto(created);
        }

        public async Task<RoundDto?> GetByIdAsync(Guid roundId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null) return null;
            return MapToDto(round);
        }

        public async Task<IEnumerable<RoundDto>> GetAllByEventAsync(Guid eventId)
        {
            var rounds = await _roundRepository.FindAsync(r => r.EventId == eventId);
            return rounds.Select(MapToDto);
        }

        public async Task<RoundDto> UpdateAsync(Guid roundId, AddRoundRequest request)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");
            if (round.IsFinalized)
                throw new Exception("Round đã chốt nên không thể chỉnh sửa.");

            var eventEntity = await _eventRepository.GetByIdAsync(round.EventId);
            if (eventEntity == null)
                throw new Exception($"Không tìm thấy sự kiện với id: {round.EventId}");

            if (request.StartDate < eventEntity.StartDate || request.EndDate > eventEntity.EndDate)
                throw new Exception("Thời gian vòng thi phải nằm trong thời gian diễn ra event.");

            var hasDuplicateRoundOrder = eventEntity.Rounds.Any(item =>
                item.RoundId != roundId && item.RoundOrder == request.RoundOrder
            );
            if (hasDuplicateRoundOrder)
                throw new Exception("Thứ tự vòng thi này đã tồn tại trong event.");

            round.RoundName = request.RoundName;
            round.RoundOrder = request.RoundOrder;
            round.SubmissionDeadline = request.SubmissionDeadline;
            round.StartDate = request.StartDate;
            round.EndDate = request.EndDate;

            _roundRepository.Update(round);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(round);
        }

        public async Task DeleteAsync(Guid roundId)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng thi với id: {roundId}");
            if (round.IsFinalized)
                throw new Exception("Round đã chốt nên không thể xóa.");

            _roundRepository.Delete(round);
            await _unitOfWork.SaveChangesAsync();
        }

        private RoundDto MapToDto(Rounds r)
        {
            return new RoundDto
            {
                RoundId = r.RoundId,
                EventId = r.EventId,
                RoundName = r.RoundName,
                RoundOrder = r.RoundOrder,
                SubmissionDeadline = r.SubmissionDeadline,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                IsFinalized = r.IsFinalized,
                FinalizedAt = r.FinalizedAt,
                EffectiveEndAtUtc = RoundTimePolicy.GetEffectiveEndAtUtc(r.EndDate)
            };
        }
    }
}
