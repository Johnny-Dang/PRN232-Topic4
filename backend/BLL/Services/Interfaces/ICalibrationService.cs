using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICalibrationService
    {
        Task<CalibrationSubmissionDto> CreateSampleSubmissionAsync(CreateCalibrationSubmissionRequest request, Guid userId);
        Task<IEnumerable<CalibrationSubmissionDto>> GetSampleSubmissionsAsync();
        Task<CalibrationSubmissionDto?> GetSampleSubmissionByIdAsync(Guid submissionId);
        Task<IEnumerable<CalibrationScoreDto>> GetScoresAsync(Guid submissionId);
        Task<(bool hasScored, IEnumerable<CalibrationScoreDto> scores)> GetMyScoresAsync(Guid submissionId, Guid judgeUserId);
        Task<IEnumerable<CalibrationScoreDto>> SubmitScoresAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request);
        Task<IEnumerable<CalibrationScoreDto>> UpdateScoresAsync(Guid submissionId, Guid judgeUserId, SubmitScoresRequest request);
        Task<CalibrationAnalysisDto> GetAnalysisAsync(Guid submissionId);
        Task<string> ExportDatasetCsvAsync(Guid submissionId, Guid userId);
        Task DeleteSampleSubmissionAsync(Guid submissionId, Guid userId);
    }
}
