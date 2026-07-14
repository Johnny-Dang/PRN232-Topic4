using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IEventBannerUploadService
    {
        CloudinaryUploadSignatureDto SignUpload(SignEventBannerUploadRequest request);
    }
}
