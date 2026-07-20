using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class SubmissionAssetDto
    {
        public Guid SubmissionAssetId { get; set; }
        public Guid? SubmissionId { get; set; }
        public Guid TeamId { get; set; }
        public Guid RoundId { get; set; }
        public string AssetType { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string CloudinaryAssetId { get; set; } = string.Empty;
        public string PublicId { get; set; } = string.Empty;
        public string SecureUrl { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public double? DurationSeconds { get; set; }
        public string UploadStatus { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UploadedAt { get; set; }
    }

    public class CloudinaryUploadSignatureDto
    {
        public Guid SubmissionAssetId { get; set; }
        public string CloudName { get; set; } = string.Empty;
        public string ApiKey { get; set; } = string.Empty;
        public long Timestamp { get; set; }
        public string Signature { get; set; } = string.Empty;
        public string Folder { get; set; } = string.Empty;
        public string PublicId { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty;
        public string UploadUrl { get; set; } = string.Empty;
        public string[] AllowedFormats { get; set; } = Array.Empty<string>();
        public long MaxFileSize { get; set; }
    }
}
