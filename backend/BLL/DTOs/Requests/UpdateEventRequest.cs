using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateEventRequest : IValidatableObject
    {
        [Required]
        public Guid EventId { get; set; }

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

        [StringLength(2000)]
        public string BannerUrl { get; set; } = string.Empty;

        [StringLength(255)]
        public string Organizer { get; set; } = string.Empty;

        [StringLength(50)]
        public string Format { get; set; } = "Online";

        [StringLength(100)]
        public string Audience { get; set; } = "Students";

        [StringLength(255)]
        public string Prize { get; set; } = string.Empty;

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

            if (!IsValidFormat(Format))
            {
                yield return new ValidationResult("Format must be Online, Offline, or Hybrid.", new[] { nameof(Format) });
            }
        }

        private static bool IsValidFormat(string format)
        {
            return string.Equals(format, "Online", StringComparison.OrdinalIgnoreCase)
                || string.Equals(format, "Offline", StringComparison.OrdinalIgnoreCase)
                || string.Equals(format, "Hybrid", StringComparison.OrdinalIgnoreCase);
        }
    }
}
