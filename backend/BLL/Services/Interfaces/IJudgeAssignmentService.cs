using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IJudgeAssignmentService
    {
        Task<JudgeAssignmentDto> CreateAsync(AddJudgeAssignmentRequest request);
        Task<JudgeAssignmentDto?> GetByIdAsync(Guid assignmentId);
        Task<IEnumerable<JudgeAssignmentDto>> GetAllAsync();
        Task<JudgeAssignmentDto> UpdateAsync(UpdateJudgeAssignmentRequest request);
        Task DeleteAsync(Guid assignmentId);
    }
}
