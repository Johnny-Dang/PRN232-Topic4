using System;

namespace DataAccessLayer.Database.Entities
{
    public class SubmissionAssets
    {
        public Guid SubmissionAssetId { get; set; }
        public Guid? SubmissionId { get; set; }
        public Guid TeamId { get; set; }
        public Guid RoundId { get; set; }
        public string AssetType { get; set; } = string.Empty;
        public string Provider { get; set; } = "Cloudinary";
        public string CloudinaryAssetId { get; set; } = string.Empty;
        public string PublicId { get; set; } = string.Empty;
        public string SecureUrl { get; set; } = string.Empty;
        public string ResourceType { get; set; } = string.Empty;
        public string OriginalFileName { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public double? DurationSeconds { get; set; }
        public string UploadStatus { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? UploadedAt { get; set; }

        public virtual Submissions? Submission { get; set; }
        public virtual Teams Team { get; set; } = null!;
        public virtual Rounds Round { get; set; } = null!;
    }
}
