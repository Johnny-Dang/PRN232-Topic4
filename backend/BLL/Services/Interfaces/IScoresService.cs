using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IScoresService
    {
        Task<ScoreDto> CreateAsync(AddScoreRequest request);
        Task<IEnumerable<ScoreDto>> SubmitForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request);
        Task<IEnumerable<ScoreDto>> UpdateForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request);
        Task<IEnumerable<JudgeSubmissionDto>> GetAssignedSubmissionsAsync(Guid judgeUserId);
        Task<ScoreDto?> GetByIdAsync(Guid scoreId);
        Task<IEnumerable<ScoreDto>> GetAllAsync();
        Task<ScoreDto> UpdateAsync(UpdateScoreRequest request);
        Task DeleteAsync(Guid scoreId);
    }
}
