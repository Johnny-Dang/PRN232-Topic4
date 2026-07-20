using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class CloudinaryOptions
    {
        public const string SectionName = "Cloudinary";

        public string CloudName { get; set; } = string.Empty;

        public string ApiKey { get; set; } = string.Empty;

        public string ApiSecret { get; set; } = string.Empty;

        public string UploadFolder { get; set; } = string.Empty;

        public void Validate()
        {
            if (string.IsNullOrWhiteSpace(CloudName))
                throw new InvalidOperationException("Cloudinary CloudName is not configured.");

            if (string.IsNullOrWhiteSpace(ApiKey))
                throw new InvalidOperationException("Cloudinary ApiKey is not configured.");

            if (string.IsNullOrWhiteSpace(ApiSecret))
                throw new InvalidOperationException("Cloudinary ApiSecret is not configured.");
        }
    }
}
