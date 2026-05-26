using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class CreateEventRequest : IValidatableObject
    {
        [Required]
        [StringLength(150, MinimumLength = 2)]
        public string EventName { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Season { get; set; } = string.Empty;

        [Range(2000, 2100)]
        public int Year { get; set; }

        [StringLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (StartDate >= EndDate)
            {
                yield return new ValidationResult("StartDate must be earlier than EndDate.", new[] { nameof(StartDate), nameof(EndDate) });
            }

            if (Year != 0 && StartDate != default && Year != StartDate.Year)
            {
                yield return new ValidationResult("Year must match the year of StartDate.", new[] { nameof(Year), nameof(StartDate) });
            }
        }
    }
}
