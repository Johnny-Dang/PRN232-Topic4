using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class SignSubmissionAssetUploadRequest
    {
        [Required]
        public Guid TeamId { get; set; }

        [Required]
        public Guid RoundId { get; set; }

        [Required]
        public string AssetType { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string ContentType { get; set; } = string.Empty;

        [Range(1, long.MaxValue)]
        public long FileSize { get; set; }
    }
}
