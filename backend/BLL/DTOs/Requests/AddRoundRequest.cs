using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddRoundRequest : IValidatableObject
    {
        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string RoundName { get; set; } = string.Empty;

        [Range(1, 100)]
        public int RoundOrder { get; set; }

        [Required]
        public DateTime SubmissionDeadline { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (StartDate >= EndDate)
            {
                yield return new ValidationResult(
                    "StartDate must be earlier than EndDate.",
                    new[] { nameof(StartDate), nameof(EndDate) }
                );
            }

            if (SubmissionDeadline < StartDate || SubmissionDeadline > EndDate)
            {
                yield return new ValidationResult(
                    "SubmissionDeadline must be within the round period.",
                    new[] { nameof(SubmissionDeadline), nameof(StartDate), nameof(EndDate) }
                );
            }
        }
    }
}
