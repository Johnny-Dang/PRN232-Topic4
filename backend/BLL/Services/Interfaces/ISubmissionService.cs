using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ISubmissionService
    {
        Task<SubmissionDto> CreateAsync(AddSubmissionRequest request, Guid userId);
        Task<SubmissionDto?> GetByIdAsync(Guid submissionId);
        Task<IEnumerable<SubmissionDto>> GetAllAsync();
        Task<SubmissionDto> UpdateAsync(UpdateSubmissionRequest request, Guid userId);
        Task DeleteAsync(Guid submissionId, Guid userId);
    }
}
