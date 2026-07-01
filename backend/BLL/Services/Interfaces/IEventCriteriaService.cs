using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IEventCriteriaService
    {
        Task<IEnumerable<EventCriteriaDto>> SetForEventAsync(Guid eventId, SetEventCriteriaRequest request, Guid userId);
        Task<IEnumerable<EventCriteriaDto>> GetByEventAsync(Guid eventId);
    }
}
