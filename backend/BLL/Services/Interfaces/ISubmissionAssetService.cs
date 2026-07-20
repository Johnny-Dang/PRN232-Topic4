using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ISubmissionAssetService
    {
        Task<CloudinaryUploadSignatureDto> SignUploadAsync(SignSubmissionAssetUploadRequest request, Guid userId);
        Task<SubmissionAssetDto> CompleteUploadAsync(CompleteSubmissionAssetUploadRequest request, Guid userId);
        Task<IEnumerable<SubmissionAssetDto>> GetBySubmissionIdAsync(Guid submissionId);
        Task<IEnumerable<SubmissionAssetDto>> GetByTeamAndRoundAsync(Guid teamId, Guid roundId);
        Task AttachAssetsToSubmissionAsync(Guid submissionId, Guid teamId, Guid roundId, Guid? videoAssetId, Guid? slideAssetId, Guid userId);
    }
}
