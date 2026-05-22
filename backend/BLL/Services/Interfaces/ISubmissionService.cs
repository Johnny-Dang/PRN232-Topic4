using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ISubmissionService
    {
        Task<SubmissionDto> CreateAsync(AddSubmissionRequest request);
        Task<SubmissionDto?> GetByIdAsync(Guid submissionId);
        Task<IEnumerable<SubmissionDto>> GetAllAsync();
        Task<SubmissionDto> UpdateAsync(UpdateSubmissionRequest request);
        Task DeleteAsync(Guid submissionId);
    }
}
