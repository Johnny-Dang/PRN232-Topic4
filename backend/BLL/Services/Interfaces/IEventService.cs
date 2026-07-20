using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IEventService
    {
        Task<EventDto> GetEventByIdAsync(Guid eventId);
        Task<List<EventDto>> GetAllEventAsync();
        Task<List<EventDto>> GetPublishedEventsAsync();
        Task<EventDto> CreateAsync(CreateEventRequest request, Guid userId);
        Task<EventDto> UpdateAsync(UpdateEventRequest request);
        Task<EventDto> PublishAsync(Guid eventId, Guid userId);
        Task<EventDto> UnpublishAsync(Guid eventId, Guid userId);
        Task<EventDto> SetFeaturedAsync(Guid eventId, bool isFeatured, Guid userId);
        Task<EventDto> AddRoundForEventAsync(Guid eventId, AddRoundRequest request, Guid userId);
        Task<EventDto> RemoveRoundForEventAsync(Guid eventId, Guid roundId);
        Task<bool> DeleteSoftAsync(Guid eventId, Guid userId);
    }
}
