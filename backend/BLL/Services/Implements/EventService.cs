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
            var @event = new Events
            {
                EventId = Guid.NewGuid(),
                EventName = request.EventName,
                Season = request.Season,
                Year = request.Year,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };

            var createdEvent = await _eventRepository.AddAsync(@event);
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

        public async Task<EventDto> AddRoundForEventAsync(Guid eventId, AddRoundRequest request)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId);
            if (@event == null)
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

            @event = await _eventRepository.GetByIdAsync(eventId);

            return MapToDto(@event!);
        }

        public async Task<EventDto> RemoveRoundForEventAsync(Guid eventId, Guid roundId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId);
            if (@event == null)
                throw new Exception($"Event with id {eventId} not found");

            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");

            if (round.EventId != eventId)
                throw new Exception($"Round with id {roundId} does not belong to event with id {eventId}");

            _roundRepository.Delete(round);
            await _unitOfWork.SaveChangesAsync();

            @event = await _eventRepository.GetByIdAsync(eventId);

            return MapToDto(@event!);
        }

        private EventDto MapToDto(Events @event)
        {
            return new EventDto
            {
                EventId = @event.EventId,
                EventName = @event.EventName,
                Season = @event.Season,
                Year = @event.Year,
                Description = @event.Description,
                StartDate = @event.StartDate,
                EndDate = @event.EndDate,
                Rounds = @event.Rounds.Select(r => new RoundDto
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
