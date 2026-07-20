using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace BusinessLogicLayer.Services.Implements
{
    public class EventBannerUploadService : IEventBannerUploadService
    {
        private const long MaxFileSize = 5 * 1024 * 1024;
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/png", "image/webp"
        };

        private readonly IConfiguration _configuration;

        public EventBannerUploadService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public CloudinaryUploadSignatureDto SignUpload(SignEventBannerUploadRequest request)
        {
            if (!AllowedContentTypes.Contains(request.ContentType))
                throw new Exception("Banner phải là ảnh JPG, PNG hoặc WebP.");

            if (request.FileSize > MaxFileSize)
                throw new Exception("Ảnh banner không được vượt quá 5 MB.");

            var cloudName = GetRequiredSetting("CloudName").ToLowerInvariant();
            var apiKey = GetRequiredSetting("ApiKey");
            var apiSecret = GetRequiredSetting("ApiSecret");
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var rootFolder = _configuration["Cloudinary:UploadFolder"] ?? "seal-hackathon";
            var folder = $"{rootFolder}/events/banners";
            var publicId = $"event-banner-{Guid.NewGuid():N}";
            var signature = GenerateSignature(folder, publicId, timestamp, apiSecret);

            return new CloudinaryUploadSignatureDto
            {
                CloudName = cloudName,
                ApiKey = apiKey,
                Timestamp = timestamp,
                Signature = signature,
                Folder = folder,
                PublicId = publicId,
                ResourceType = "image",
                UploadUrl = $"https://api.cloudinary.com/v1_1/{cloudName}/image/upload",
                AllowedFormats = new[] { "jpg", "jpeg", "png", "webp" },
                MaxFileSize = MaxFileSize
            };
        }

        private string GetRequiredSetting(string key) =>
            _configuration[$"Cloudinary:{key}"]?.Trim()
            ?? throw new Exception($"Cloudinary:{key} is not configured.");

        private static string GenerateSignature(string folder, string publicId, long timestamp, string apiSecret)
        {
            var payload = $"folder={folder}&public_id={publicId}&timestamp={timestamp.ToString(CultureInfo.InvariantCulture)}";
            using var sha1 = SHA1.Create();
            return Convert.ToHexString(sha1.ComputeHash(Encoding.UTF8.GetBytes(payload + apiSecret))).ToLowerInvariant();
        }
    }
}
