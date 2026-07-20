using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;


namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file, string folder, CancellationToken cancellationToken = default);

        Task<List<string>> UploadImagesAsync(IEnumerable<IFormFile> files, string folder, CancellationToken cancellationToken = default);

        Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default);

        Task<int> DeleteImagesAsync(IEnumerable<string> publicIds, CancellationToken cancellationToken = default);

        string GetImageUrl(string publicId, int? width = null, int? height = null, string quality = "auto");
    }
}
