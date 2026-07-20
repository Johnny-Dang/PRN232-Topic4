using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateSubmissionRequest : IValidatableObject
    {
        [Required]
        public Guid SubmissionId { get; set; }

        [Url]
        [StringLength(500)]
        public string? RepositoryURL { get; set; }

        [Url]
        [StringLength(500)]
        public string? DemoURL { get; set; }

        [Url]
        [StringLength(500)]
        public string? SlideURL { get; set; }

        public Guid? VideoAssetId { get; set; }

        public Guid? SlideAssetId { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrWhiteSpace(RepositoryURL) && string.IsNullOrWhiteSpace(DemoURL) && string.IsNullOrWhiteSpace(SlideURL) && VideoAssetId == null && SlideAssetId == null)
            {
                yield return new ValidationResult("At least one URL or uploaded asset must be provided.", new[] { nameof(RepositoryURL), nameof(DemoURL), nameof(SlideURL), nameof(VideoAssetId), nameof(SlideAssetId) });
            }
        }
    }
}
