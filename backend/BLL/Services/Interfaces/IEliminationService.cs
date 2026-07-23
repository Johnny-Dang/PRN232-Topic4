using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IEliminationService
    {
        Task<List<EliminationDto>> GetAllAsync();
        Task<EliminationDto> CreateEliminationAsync(Guid coordinatorUserId, CreateEliminationDto dto);
    }
}
