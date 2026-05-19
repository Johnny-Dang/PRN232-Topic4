using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IRoundRepository _roundRepository;
        private readonly IUnitOfWork _unitOfWork;

        public EventService(IEventRepository eventRepository, IRoundRepository roundRepository, IUnitOfWork unitOfWork)
        {
            _eventRepository = eventRepository;
            _roundRepository = roundRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<EventDto> CreateAsync(CreateEventRequest request)
        {
            var eventEntity = new Events
            {
                EventId = Guid.NewGuid(),
                EventName = request.EventName,
                Season = request.Season,
                Year = request.Year,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };

            var createdEvent = await _eventRepository.AddAsync(eventEntity);
            await _unitOfWork.SaveChangesAsync();

            return new EventDto
            {
                EventId = createdEvent.EventId,
                EventName = createdEvent.EventName,
                Season = createdEvent.Season,
                Year = createdEvent.Year,
                Description = createdEvent.Description,
                StartDate = createdEvent.StartDate,
                EndDate = createdEvent.EndDate,
                Rounds = new List<RoundDto>()
            };
        }

        public async Task<EventDto> UpdateAsync(UpdateEventRequest request)
        {
            var eventEntity = await _eventRepository.FirstOrDefaultAsync(x => x.EventId == request.EventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {request.EventId} not found");

            eventEntity.EventName = request.EventName;
            eventEntity.Season = request.Season;
            eventEntity.Year = request.Year;
            eventEntity.Description = request.Description;
            eventEntity.StartDate = request.StartDate;
            eventEntity.EndDate = request.EndDate;

            _eventRepository.Update(eventEntity);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(eventEntity);
        }

        public async Task<EventDto> GetEventByIdAsync(Guid eventId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

            return MapToDto(eventEntity);
        }

        public async Task<List<EventDto>> GetAllEventAsync()
        {
            var events = await _eventRepository.GetAllAsync();
            return events.Select(MapToDto).ToList();
        }

        public async Task<EventDto> AddRoundForEventAsync(Guid eventId, AddRoundRequest request)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

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

            await _roundRepository.AddAsync(round);
            await _unitOfWork.SaveChangesAsync();

            eventEntity = await _eventRepository.GetByIdAsync(eventId);

            return MapToDto(eventEntity!);
        }

        public async Task<EventDto> RemoveRoundForEventAsync(Guid eventId, Guid roundId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");

            if (round.EventId != eventId)
                throw new Exception($"Round with id {roundId} does not belong to event with id {eventId}");

            _roundRepository.Delete(round);
            await _unitOfWork.SaveChangesAsync();

            eventEntity = await _eventRepository.GetByIdAsync(eventId);

            return MapToDto(eventEntity!);
        }

        private EventDto MapToDto(Events eventEntity)
        {
            return new EventDto
            {
                EventId = eventEntity.EventId,
                EventName = eventEntity.EventName,
                Season = eventEntity.Season,
                Year = eventEntity.Year,
                Description = eventEntity.Description,
                StartDate = eventEntity.StartDate,
                EndDate = eventEntity.EndDate,
                Rounds = eventEntity.Rounds.Select(r => new RoundDto
                {
                    RoundId = r.RoundId,
                    EventId = r.EventId,
                    RoundName = r.RoundName,
                    RoundOrder = r.RoundOrder,
                    SubmissionDeadline = r.SubmissionDeadline,
                    StartDate = r.StartDate,
                    EndDate = r.EndDate
                }).ToList()
            };
        }
    }
}
