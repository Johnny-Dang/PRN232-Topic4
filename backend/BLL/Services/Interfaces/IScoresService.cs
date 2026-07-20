using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IScoresService
    {
        Task<IEnumerable<ScoreDto>> SubmitForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request);
        Task<IEnumerable<ScoreDto>> UpdateForSubmissionAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request);
        Task<IEnumerable<JudgeSubmissionDto>> GetAssignedSubmissionsAsync(Guid judgeUserId);
        Task<IEnumerable<ScoreDto>> GetScoresBySubmissionForTeamAsync(Guid submissionId, Guid viewerUserId);
    }
}
