using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class SubmissionAssetService : ISubmissionAssetService
    {
        private const string VideoAssetType = "VideoDemo";
        private const string SlideAssetType = "SlideDocument";
        private const string UploadedStatus = "Uploaded";
        private const string PendingStatus = "Pending";

        private static readonly HashSet<string> VideoContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "video/mp4",
            "video/webm",
            "video/quicktime"
        };

        private static readonly HashSet<string> SlideContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };

        private static readonly HashSet<string> SlideExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".ppt",
            ".pptx",
            ".doc",
            ".docx"
        };

        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly IGenericRepository<SubmissionAssets> _assetRepository;
        private readonly IGenericRepository<Teams> _teamRepository;
        private readonly IGenericRepository<Rounds> _roundRepository;
        private readonly IGenericRepository<Submissions> _submissionRepository;

        public SubmissionAssetService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _assetRepository = _unitOfWork.GetRepository<SubmissionAssets>();
            _teamRepository = _unitOfWork.GetRepository<Teams>();
            _roundRepository = _unitOfWork.GetRepository<Rounds>();
            _submissionRepository = _unitOfWork.GetRepository<Submissions>();
        }

        public async Task<CloudinaryUploadSignatureDto> SignUploadAsync(SignSubmissionAssetUploadRequest request, Guid userId)
        {
            var team = await GetLeaderTeamAsync(request.TeamId, userId);
            var round = await GetOpenRoundAsync(request.RoundId, team);
            var resourceType = GetResourceType(request.AssetType);
            var maxFileSize = GetMaxFileSize(request.AssetType);

            ValidateUploadFile(request, maxFileSize);

            var cloudName = GetCloudinaryCloudName();
            var apiKey = GetRequiredCloudinarySetting("ApiKey");
            var apiSecret = GetRequiredCloudinarySetting("ApiSecret");
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var uploadFolder = _configuration["Cloudinary:UploadFolder"] ?? "seal-hackathon";
            var folder = $"{uploadFolder}/teams/{team.TeamId}/rounds/{round.RoundId}";
            var publicId = $"{NormalizeAssetType(request.AssetType)}-{Guid.NewGuid():N}";

            var signature = GenerateSignature(new Dictionary<string, string>
            {
                ["folder"] = folder,
                ["public_id"] = publicId,
                ["timestamp"] = timestamp.ToString(CultureInfo.InvariantCulture)
            }, apiSecret);

            var asset = new SubmissionAssets
            {
                SubmissionAssetId = Guid.NewGuid(),
                TeamId = request.TeamId,
                RoundId = request.RoundId,
                AssetType = NormalizeAssetType(request.AssetType),
                Provider = "Cloudinary",
                PublicId = $"{folder}/{publicId}",
                ResourceType = resourceType,
                OriginalFileName = Path.GetFileName(request.FileName),
                ContentType = request.ContentType,
                FileSize = request.FileSize,
                UploadStatus = PendingStatus,
                CreatedAt = DateTime.UtcNow
            };

            await _assetRepository.AddAsync(asset);
            await _unitOfWork.SaveChangesAsync();

            return new CloudinaryUploadSignatureDto
            {
                SubmissionAssetId = asset.SubmissionAssetId,
                CloudName = cloudName,
                ApiKey = apiKey,
                Timestamp = timestamp,
                Signature = signature,
                Folder = folder,
                PublicId = publicId,
                ResourceType = resourceType,
                UploadUrl = $"https://api.cloudinary.com/v1_1/{cloudName}/{resourceType}/upload",
                AllowedFormats = GetAllowedFormats(asset.AssetType),
                MaxFileSize = maxFileSize
            };
        }

        public async Task<SubmissionAssetDto> CompleteUploadAsync(CompleteSubmissionAssetUploadRequest request, Guid userId)
        {
            var asset = await _assetRepository.GetByIdAsync(request.SubmissionAssetId);
            if (asset == null)
                throw new Exception($"Submission asset with id {request.SubmissionAssetId} not found");

            await GetLeaderTeamAsync(asset.TeamId, userId);
            ValidateCompletedAsset(asset, request);

            asset.CloudinaryAssetId = request.CloudinaryAssetId;
            asset.PublicId = request.PublicId;
            asset.SecureUrl = request.SecureUrl;
            asset.ResourceType = request.ResourceType;
            asset.Format = request.Format;
            asset.FileSize = request.FileSize;
            asset.DurationSeconds = request.DurationSeconds;
            asset.UploadStatus = UploadedStatus;
            asset.UploadedAt = DateTime.UtcNow;

            _assetRepository.Update(asset);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(asset);
        }

        public async Task<IEnumerable<SubmissionAssetDto>> GetBySubmissionIdAsync(Guid submissionId)
        {
            var assets = await _assetRepository.FindAsync(x => x.SubmissionId == submissionId && x.UploadStatus == UploadedStatus);
            return assets.Select(MapToDto);
        }

        public async Task<IEnumerable<SubmissionAssetDto>> GetByTeamAndRoundAsync(Guid teamId, Guid roundId)
        {
            var assets = await _assetRepository.FindAsync(x => x.TeamId == teamId && x.RoundId == roundId && x.UploadStatus == UploadedStatus);
            return assets.Select(MapToDto);
        }

        public async Task AttachAssetsToSubmissionAsync(Guid submissionId, Guid teamId, Guid roundId, Guid? videoAssetId, Guid? slideAssetId, Guid userId)
        {
            await GetLeaderTeamAsync(teamId, userId);
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Submission with id {submissionId} not found");

            var existingAssets = await _assetRepository.FindAsync(x => x.SubmissionId == submissionId);

            // Process Video Asset
            if (videoAssetId != null)
            {
                foreach (var oldVideo in existingAssets.Where(x => string.Equals(x.AssetType, VideoAssetType, StringComparison.OrdinalIgnoreCase) && x.SubmissionAssetId != videoAssetId.Value))
                {
                    oldVideo.SubmissionId = null;
                    _assetRepository.Update(oldVideo);
                }
                await AttachAssetAsync(videoAssetId.Value, submissionId, teamId, roundId, VideoAssetType);
            }
            else
            {
                foreach (var oldVideo in existingAssets.Where(x => string.Equals(x.AssetType, VideoAssetType, StringComparison.OrdinalIgnoreCase)))
                {
                    oldVideo.SubmissionId = null;
                    _assetRepository.Update(oldVideo);
                }
            }

            // Process Slide Asset
            if (slideAssetId != null)
            {
                foreach (var oldSlide in existingAssets.Where(x => string.Equals(x.AssetType, SlideAssetType, StringComparison.OrdinalIgnoreCase) && x.SubmissionAssetId != slideAssetId.Value))
                {
                    oldSlide.SubmissionId = null;
                    _assetRepository.Update(oldSlide);
                }
                await AttachAssetAsync(slideAssetId.Value, submissionId, teamId, roundId, SlideAssetType);
            }
            else
            {
                foreach (var oldSlide in existingAssets.Where(x => string.Equals(x.AssetType, SlideAssetType, StringComparison.OrdinalIgnoreCase)))
                {
                    oldSlide.SubmissionId = null;
                    _assetRepository.Update(oldSlide);
                }
            }

            await _unitOfWork.SaveChangesAsync();
        }

        private async Task AttachAssetAsync(Guid assetId, Guid submissionId, Guid teamId, Guid roundId, string expectedAssetType)
        {
            var asset = await _assetRepository.GetByIdAsync(assetId);
            if (asset == null)
                throw new Exception($"Submission asset with id {assetId} not found");

            if (asset.TeamId != teamId || asset.RoundId != roundId)
                throw new Exception("Uploaded asset does not belong to this team and round.");

            if (!string.Equals(asset.AssetType, expectedAssetType, StringComparison.OrdinalIgnoreCase))
                throw new Exception($"Uploaded asset must be {expectedAssetType}.");

            if (!string.Equals(asset.UploadStatus, UploadedStatus, StringComparison.OrdinalIgnoreCase))
                throw new Exception("Uploaded asset has not been completed.");

            asset.SubmissionId = submissionId;
            _assetRepository.Update(asset);
        }

        private async Task<Teams> GetLeaderTeamAsync(Guid teamId, Guid userId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Team with id {teamId} not found");

            if (team.TeamLeaderId != userId)
                throw new Exception("Only the team leader can upload submission assets.");

            return team;
        }

        private async Task<Rounds> GetOpenRoundAsync(Guid roundId, Teams team)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Round with id {roundId} not found");

            if (team.EventId != null && team.EventId != round.EventId)
                throw new Exception("Round does not belong to the team's event.");

            if (DateTime.UtcNow < round.StartDate)
                throw new Exception($"Submission is not yet open. Uploads will be accepted starting from {round.StartDate:yyyy-MM-dd HH:mm:ss} UTC.");
            if (DateTime.UtcNow > round.SubmissionDeadline)
                throw new Exception("Submission deadline has passed. You cannot upload files for this round.");

            return round;
        }

        private void ValidateUploadFile(SignSubmissionAssetUploadRequest request, long maxFileSize)
        {
            var assetType = NormalizeAssetType(request.AssetType);
            if (request.FileSize > maxFileSize)
                throw new Exception($"File size exceeds the limit of {maxFileSize} bytes.");

            if (assetType == VideoAssetType)
            {
                var extension = Path.GetExtension(request.FileName);
                var isAllowedExt = new[] { ".mp4", ".webm", ".mov" }.Contains(extension, StringComparer.OrdinalIgnoreCase);
                var isAllowedMime = VideoContentTypes.Contains(request.ContentType) || 
                                    string.Equals(request.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase) ||
                                    string.IsNullOrWhiteSpace(request.ContentType);

                if (!isAllowedExt && !isAllowedMime)
                    throw new Exception("Video demo must be mp4, webm, or mov.");
                return;
            }

            if (assetType == SlideAssetType)
            {
                var extension = Path.GetExtension(request.FileName);
                var isAllowedExt = SlideExtensions.Contains(extension);
                var isAllowedMime = SlideContentTypes.Contains(request.ContentType) || 
                                    string.Equals(request.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase) ||
                                    string.IsNullOrWhiteSpace(request.ContentType);

                if (!isAllowedExt && !isAllowedMime)
                    throw new Exception("Slide document must be ppt, pptx, doc, or docx.");
                return;
            }

            throw new Exception("Unsupported asset type.");
        }

        private static void ValidateCompletedAsset(SubmissionAssets asset, CompleteSubmissionAssetUploadRequest request)
        {
            if (!string.Equals(asset.ResourceType, request.ResourceType, StringComparison.OrdinalIgnoreCase))
                throw new Exception("Cloudinary resource type does not match the signed upload.");

            if (string.IsNullOrWhiteSpace(request.PublicId) || !request.PublicId.StartsWith(asset.PublicId, StringComparison.OrdinalIgnoreCase))
                throw new Exception("Cloudinary public id does not match the signed upload.");

            if (request.FileSize <= 0)
                throw new Exception("Cloudinary file size is invalid.");
        }

        private string GetRequiredCloudinarySetting(string key)
        {
            var value = _configuration[$"Cloudinary:{key}"];
            if (string.IsNullOrWhiteSpace(value))
                throw new Exception($"Cloudinary:{key} is not configured.");
            return value.Trim();
        }

        private string GetCloudinaryCloudName()
        {
            var cloudName = GetRequiredCloudinarySetting("CloudName").ToLowerInvariant();
            if (!cloudName.All(c => char.IsLetterOrDigit(c) || c == '-' || c == '_'))
                throw new Exception("Cloudinary:CloudName must contain only letters, numbers, hyphen, or underscore.");

            return cloudName;
        }

        private long GetMaxFileSize(string assetType)
        {
            var normalized = NormalizeAssetType(assetType);
            var configKey = normalized == VideoAssetType ? "VideoMaxBytes" : "DocumentMaxBytes";
            var fallback = normalized == VideoAssetType ? 500L * 1024L * 1024L : 50L * 1024L * 1024L;
            return long.TryParse(_configuration[$"Cloudinary:{configKey}"], out var value) && value > 0 ? value : fallback;
        }

        private static string GetResourceType(string assetType)
        {
            var normalized = NormalizeAssetType(assetType);
            return normalized == VideoAssetType ? "video" : "raw";
        }

        private static string[] GetAllowedFormats(string assetType)
        {
            var normalized = NormalizeAssetType(assetType);
            return normalized == VideoAssetType
                ? new[] { "mp4", "webm", "mov" }
                : new[] { "ppt", "pptx", "doc", "docx" };
        }

        private static string NormalizeAssetType(string assetType)
        {
            if (string.Equals(assetType, VideoAssetType, StringComparison.OrdinalIgnoreCase)) return VideoAssetType;
            if (string.Equals(assetType, SlideAssetType, StringComparison.OrdinalIgnoreCase)) return SlideAssetType;
            throw new Exception("AssetType must be VideoDemo or SlideDocument.");
        }

        private static string GenerateSignature(Dictionary<string, string> parameters, string apiSecret)
        {
            var payload = string.Join("&", parameters
                .Where(x => !string.IsNullOrWhiteSpace(x.Value))
                .OrderBy(x => x.Key, StringComparer.Ordinal)
                .Select(x => $"{x.Key}={x.Value}"));

            using var sha1 = SHA1.Create();
            var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(payload + apiSecret));
            return Convert.ToHexString(hash).ToLowerInvariant();
        }

        private static SubmissionAssetDto MapToDto(SubmissionAssets asset)
        {
            return new SubmissionAssetDto
            {
                SubmissionAssetId = asset.SubmissionAssetId,
                SubmissionId = asset.SubmissionId,
                TeamId = asset.TeamId,
                RoundId = asset.RoundId,
                AssetType = asset.AssetType,
                Provider = asset.Provider,
                CloudinaryAssetId = asset.CloudinaryAssetId,
                PublicId = asset.PublicId,
                SecureUrl = asset.SecureUrl,
                ResourceType = asset.ResourceType,
                OriginalFileName = asset.OriginalFileName,
                Format = asset.Format,
                ContentType = asset.ContentType,
                FileSize = asset.FileSize,
                DurationSeconds = asset.DurationSeconds,
                UploadStatus = asset.UploadStatus,
                CreatedAt = asset.CreatedAt,
                UploadedAt = asset.UploadedAt
            };
        }
    }
}
