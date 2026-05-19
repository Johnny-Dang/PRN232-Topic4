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
        Task<EventDto> CreateAsync(CreateEventRequest request);
        Task<EventDto> AddRoundForEventAsync(Guid eventId, AddRoundRequest request);
        Task<EventDto> RemoveRoundForEventAsync(Guid eventId, Guid roundId);
    }
}
