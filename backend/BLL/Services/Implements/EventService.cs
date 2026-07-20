using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;

namespace BusinessLogicLayer.Services.Implements
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IRoundRepository _roundRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;

        public EventService(
            IEventRepository eventRepository,
            IRoundRepository roundRepository,
            IUnitOfWork unitOfWork,
            ICloudinaryService cloudinaryService
        )
        {
            _eventRepository = eventRepository;
            _roundRepository = roundRepository;
            _unitOfWork = unitOfWork;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<EventDto> CreateAsync(CreateEventRequest request, Guid userId)
        {

            var uploadedUrl = string.Empty;
            if (request.BannerImage is not null)
            {
                try
                {
                    uploadedUrl = await _cloudinaryService.UploadImageAsync(request.BannerImage,"temp fix");
                }
                catch (Exception ex) 
                {
                    throw new ArgumentException("fail upload image");
                }
            }

            var eventEntity = new Events
            {
                EventId = Guid.NewGuid(),
                EventName = request.EventName,
                Season = request.Season,
                Year = request.Year,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Status = "Draft",
                IsPublished = false,
                IsFeatured = false,
                BannerUrl = uploadedUrl,
                Organizer = request.Organizer,
                Format = request.Format,
                Audience = request.Audience,
                Prize = request.Prize,
            };

            var createdEvent = await _eventRepository.AddAsync(eventEntity);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "EVENT_CREATE",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(
                    new
                    {
                        createdEvent.EventId,
                        createdEvent.EventName,
                        createdEvent.Season,
                        createdEvent.Year,
                        createdEvent.Description,
                        createdEvent.StartDate,
                        createdEvent.EndDate,
                        createdEvent.Status,
                        createdEvent.IsPublished,
                        createdEvent.IsFeatured,
                        createdEvent.BannerUrl,
                        createdEvent.Organizer,
                        createdEvent.Format,
                        createdEvent.Audience,
                        createdEvent.Prize,
                    }
                ),
                CreatedAt = DateTime.UtcNow,
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

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
                Status = createdEvent.Status,
                IsPublished = createdEvent.IsPublished,
                PublishedAt = createdEvent.PublishedAt,
                PublishedBy = createdEvent.PublishedBy,
                IsFeatured = createdEvent.IsFeatured,
                BannerUrl = createdEvent.BannerUrl,
                Organizer = createdEvent.Organizer,
                Format = createdEvent.Format,
                Audience = createdEvent.Audience,
                Prize = createdEvent.Prize,
                Rounds = new List<RoundDto>(),
            };
        }

        public async Task<EventDto> UpdateAsync(UpdateEventRequest request)
        {
            var eventEntity = await _eventRepository.FirstOrDefaultAsync(x =>
                x.EventId == request.EventId
            );
            if (eventEntity == null)
                throw new Exception($"Event with id {request.EventId} not found");

            eventEntity.EventName = request.EventName;
            eventEntity.Season = request.Season;
            eventEntity.Year = request.Year;
            eventEntity.Description = request.Description;
            eventEntity.StartDate = request.StartDate;
            eventEntity.EndDate = request.EndDate;
            eventEntity.BannerUrl = request.BannerUrl;
            eventEntity.Organizer = request.Organizer;
            eventEntity.Format = request.Format;
            eventEntity.Audience = request.Audience;
            eventEntity.Prize = request.Prize;

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

        public async Task<List<EventDto>> GetPublishedEventsAsync()
        {
            var events = await _eventRepository.FindAsync(x =>
                x.IsPublished && x.Status == "Published"
            );
            return events
                .OrderByDescending(x => x.IsFeatured)
                .ThenBy(x => x.StartDate)
                .Select(MapToDto)
                .ToList();
        }

        public async Task<EventDto> PublishAsync(Guid eventId, Guid userId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

            eventEntity.IsPublished = true;
            eventEntity.Status = "Published";
            eventEntity.PublishedAt = DateTime.UtcNow;
            eventEntity.PublishedBy = userId;

            _eventRepository.Update(eventEntity);
            await WriteAuditLogAsync(
                userId,
                "EVENT_PUBLISH",
                JsonSerializer.Serialize(
                    new
                    {
                        eventEntity.EventId,
                        eventEntity.EventName,
                        eventEntity.IsPublished,
                        eventEntity.Status,
                        eventEntity.PublishedAt,
                    }
                )
            );
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(eventEntity);
        }

        public async Task<EventDto> UnpublishAsync(Guid eventId, Guid userId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

            eventEntity.IsPublished = false;
            eventEntity.IsFeatured = false;
            eventEntity.Status = "Draft";
            eventEntity.PublishedAt = null;
            eventEntity.PublishedBy = null;

            _eventRepository.Update(eventEntity);
            await WriteAuditLogAsync(
                userId,
                "EVENT_UNPUBLISH",
                JsonSerializer.Serialize(
                    new
                    {
                        eventEntity.EventId,
                        eventEntity.EventName,
                        eventEntity.IsPublished,
                        eventEntity.Status,
                        eventEntity.IsFeatured,
                    }
                )
            );
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(eventEntity);
        }

        public async Task<EventDto> SetFeaturedAsync(Guid eventId, bool isFeatured, Guid userId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

            if (isFeatured && !eventEntity.IsPublished)
                throw new Exception("Only published events can be featured on the home page.");

            eventEntity.IsFeatured = isFeatured;

            _eventRepository.Update(eventEntity);
            await WriteAuditLogAsync(
                userId,
                isFeatured ? "EVENT_FEATURE" : "EVENT_UNFEATURE",
                JsonSerializer.Serialize(
                    new
                    {
                        eventEntity.EventId,
                        eventEntity.EventName,
                        eventEntity.IsFeatured,
                    }
                )
            );
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(eventEntity);
        }

        public async Task<EventDto> AddRoundForEventAsync(
            Guid eventId,
            AddRoundRequest request,
            Guid userId
        )
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

            if (request.StartDate < eventEntity.StartDate || request.EndDate > eventEntity.EndDate)
                throw new Exception("Thời gian vòng thi phải nằm trong thời gian diễn ra event.");

            var hasDuplicateRoundOrder = eventEntity.Rounds.Any(round =>
                round.RoundOrder == request.RoundOrder
            );
            if (hasDuplicateRoundOrder)
                throw new Exception("Thứ tự vòng thi này đã tồn tại trong event.");

            var round = new Rounds
            {
                RoundId = Guid.NewGuid(),
                EventId = eventId,
                RoundName = request.RoundName,
                RoundOrder = request.RoundOrder,
                SubmissionDeadline = request.SubmissionDeadline,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
            };

            await _roundRepository.AddAsync(round);

            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = "ROUND_CREATE",
                OldValue = null,
                NewValue = JsonSerializer.Serialize(
                    new
                    {
                        round.RoundId,
                        round.EventId,
                        round.RoundName,
                        round.RoundOrder,
                        round.SubmissionDeadline,
                        round.StartDate,
                        round.EndDate,
                    }
                ),
                CreatedAt = DateTime.UtcNow,
            };
            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);

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
                throw new Exception(
                    $"Round with id {roundId} does not belong to event with id {eventId}"
                );

            _roundRepository.Delete(round);
            await _unitOfWork.SaveChangesAsync();

            eventEntity = await _eventRepository.GetByIdAsync(eventId);

            return MapToDto(eventEntity!);
        }

        public async Task<bool> DeleteSoftAsync(Guid eventId, Guid userId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new Exception($"Event with id {eventId} not found");

            eventEntity.IsDeleted = true;
            _eventRepository.Update(eventEntity);

            await WriteAuditLogAsync(
                userId,
                "EVENT_DELETE",
                JsonSerializer.Serialize(
                    new
                    {
                        eventEntity.EventId,
                        eventEntity.EventName,
                        IsDeleted = true
                    }
                )
            );

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        private async Task WriteAuditLogAsync(Guid userId, string actionType, string newValue)
        {
            var auditLog = new AuditLogs
            {
                LogId = Guid.NewGuid(),
                UserId = userId,
                ActionType = actionType,
                OldValue = null,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow,
            };

            await _unitOfWork.GetRepository<AuditLogs>().AddAsync(auditLog);
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
                Status = eventEntity.Status,
                IsPublished = eventEntity.IsPublished,
                PublishedAt = eventEntity.PublishedAt,
                PublishedBy = eventEntity.PublishedBy,
                IsFeatured = eventEntity.IsFeatured,
                BannerUrl = eventEntity.BannerUrl,
                Organizer = eventEntity.Organizer,
                Format = eventEntity.Format,
                Audience = eventEntity.Audience,
                Prize = eventEntity.Prize,
                Rounds = eventEntity
                    .Rounds.Select(r => new RoundDto
                    {
                        RoundId = r.RoundId,
                        EventId = r.EventId,
                        RoundName = r.RoundName,
                        RoundOrder = r.RoundOrder,
                        SubmissionDeadline = r.SubmissionDeadline,
                        StartDate = r.StartDate,
                        EndDate = r.EndDate,
                    })
                    .ToList(),
            };
        }
    }
}
