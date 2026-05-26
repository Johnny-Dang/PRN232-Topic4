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
        public string RepositoryURL { get; set; } = string.Empty;

        [Url]
        [StringLength(500)]
        public string DemoURL { get; set; } = string.Empty;

        [Url]
        [StringLength(500)]
        public string SlideURL { get; set; } = string.Empty;

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (string.IsNullOrWhiteSpace(RepositoryURL) && string.IsNullOrWhiteSpace(DemoURL) && string.IsNullOrWhiteSpace(SlideURL))
            {
                yield return new ValidationResult("At least one URL must be provided.", new[] { nameof(RepositoryURL), nameof(DemoURL), nameof(SlideURL) });
            }
        }
    }
}
