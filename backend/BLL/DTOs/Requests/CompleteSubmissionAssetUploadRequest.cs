using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class CompleteSubmissionAssetUploadRequest
    {
        [Required]
        public Guid SubmissionAssetId { get; set; }

        [Required]
        [StringLength(255)]
        public string CloudinaryAssetId { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string PublicId { get; set; } = string.Empty;

        [Required]
        [Url]
        [StringLength(2000)]
        public string SecureUrl { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string ResourceType { get; set; } = string.Empty;

        [StringLength(20)]
        public string Format { get; set; } = string.Empty;

        [Range(1, long.MaxValue)]
        public long FileSize { get; set; }

        public double? DurationSeconds { get; set; }
    }
}
