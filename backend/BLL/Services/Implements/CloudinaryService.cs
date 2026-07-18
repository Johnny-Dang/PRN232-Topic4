using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using BusinessLogicLayer.DTOs.Requests;

namespace BusinessLogicLayer.Services.Implements
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly CloudinaryOptions _options;
        private readonly ILogger<CloudinaryService> _logger;

        // Allowed image extensions
        private static readonly HashSet<string> AllowedExtensions = new()
    {
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".ico"
    };

        // Maximum file size: 5MB
        private const long MaxFileSize = 5 * 1024 * 1024;

        public CloudinaryService(
            IOptions<CloudinaryOptions> options,
            ILogger<CloudinaryService> logger)
        {
            _options = options.Value;
            _options.Validate();

            var account = new Account(_options.CloudName, _options.ApiKey, _options.ApiSecret);
            _cloudinary = new Cloudinary(account);

            _logger = logger;
        }

        /// <summary>
        /// Upload a single image to Cloudinary
        /// </summary>
        public async Task<string> UploadImageAsync(IFormFile file, string folder, CancellationToken cancellationToken = default)
        {
            ValidateFile(file);

            try
            {
                using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = $"{_options.UploadFolder}", 
                    Overwrite = false,
                    Transformation = new Transformation()
                        .Quality("auto")
                        .FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

                if (uploadResult.Error != null)
                {
                    _logger.LogError("Cloudinary upload error: {Error}", uploadResult.Error.Message);
                    throw new InvalidOperationException($"Failed to upload image: {uploadResult.Error.Message}");
                }

                _logger.LogInformation("Image uploaded successfully: {PublicId}", uploadResult.PublicId);
                return uploadResult.SecureUrl.ToString();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image to Cloudinary");
                throw;
            }
        }

        /// <summary>
        /// Upload multiple images to Cloudinary
        /// </summary>
        public async Task<List<string>> UploadImagesAsync(IEnumerable<IFormFile> files, string folder, CancellationToken cancellationToken = default)
        {
            var uploadedUrls = new List<string>();
            var fileList = files.ToList();

            foreach (var file in fileList)
            {
                try
                {
                    var url = await UploadImageAsync(file, folder, cancellationToken);
                    uploadedUrls.Add(url);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading file: {FileName}", file.FileName);
                    throw;
                }
            }

            return uploadedUrls;
        }

        /// <summary>
        /// Delete an image from Cloudinary
        /// </summary>
        public async Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(publicId))
            {
                _logger.LogWarning("Attempted to delete image with empty publicId");
                return false;
            }

            try
            {
                var deleteParams = new DeletionParams(publicId);
                var deleteResult = await _cloudinary.DestroyAsync(deleteParams);

                if (deleteResult.Error != null)
                {
                    _logger.LogError("Cloudinary delete error: {Error}", deleteResult.Error.Message);
                    return false;
                }

                _logger.LogInformation("Image deleted successfully: {PublicId}", publicId);
                return deleteResult.Result == "ok";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image from Cloudinary: {PublicId}", publicId);
                throw;
            }
        }

        /// <summary>
        /// Delete multiple images from Cloudinary
        /// </summary>
        public async Task<int> DeleteImagesAsync(IEnumerable<string> publicIds, CancellationToken cancellationToken = default)
        {
            var publicIdList = publicIds.Where(id => !string.IsNullOrWhiteSpace(id)).ToList();
            var deletedCount = 0;

            foreach (var publicId in publicIdList)
            {
                try
                {
                    var deleted = await DeleteImageAsync(publicId, cancellationToken);
                    if (deleted)
                        deletedCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting image: {PublicId}", publicId);
                }
            }

            return deletedCount;
        }

        /// <summary>
        /// Get image URL with transformations
        /// </summary>
        public string GetImageUrl(string publicId, int? width = null, int? height = null, string quality = "auto")
        {
            if (string.IsNullOrWhiteSpace(publicId))
                throw new ArgumentException("PublicId cannot be empty", nameof(publicId));

            var transformation = new Transformation()
                .Quality(quality)
                .FetchFormat("auto");

            if (width.HasValue && height.HasValue)
            {
                transformation = transformation.Width(width.Value).Height(height.Value).Crop("fill");
            }
            else if (width.HasValue)
            {
                transformation = transformation.Width(width.Value).Crop("scale");
            }
            else if (height.HasValue)
            {
                transformation = transformation.Height(height.Value).Crop("scale");
            }

            var url = _cloudinary.Api.UrlImgUp
                .Transform(transformation)
                .BuildUrl(publicId);

            return url;
        }

        /// <summary>
        /// Validate uploaded file
        /// </summary>
        private static void ValidateFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty", nameof(file));

            if (file.Length > MaxFileSize)
                throw new ArgumentException($"File size exceeds maximum allowed size of {MaxFileSize / (1024 * 1024)}MB", nameof(file));

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                throw new ArgumentException($"File type '{extension}' is not allowed. Allowed types: {string.Join(", ", AllowedExtensions)}", nameof(file));
        }
    }
}
