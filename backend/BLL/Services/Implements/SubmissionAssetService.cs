using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Services.Interfaces;
using BusinessLogicLayer.Utilities;
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
        private readonly IRoundEligibilityService _roundEligibilityService;

        public SubmissionAssetService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            IRoundEligibilityService roundEligibilityService)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _roundEligibilityService = roundEligibilityService;
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
                throw new Exception($"Không tìm thấy file đính kèm với id: {request.SubmissionAssetId}");

            var team = await GetLeaderTeamAsync(asset.TeamId, userId);
            await GetOpenRoundAsync(asset.RoundId, team);
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
            var team = await GetLeaderTeamAsync(teamId, userId);
            await GetOpenRoundAsync(roundId, team);
            var submission = await _submissionRepository.GetByIdAsync(submissionId);
            if (submission == null)
                throw new Exception($"Không tìm thấy bài nộp với id: {submissionId}");

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
                throw new Exception($"Không tìm thấy file đính kèm với id: {assetId}");

            if (asset.TeamId != teamId || asset.RoundId != roundId)
                throw new Exception("File upload không thuộc về đội và vòng thi này.");

            if (!string.Equals(asset.AssetType, expectedAssetType, StringComparison.OrdinalIgnoreCase))
                throw new Exception($"File upload phải là loại: {expectedAssetType}.");

            if (!string.Equals(asset.UploadStatus, UploadedStatus, StringComparison.OrdinalIgnoreCase))
                throw new Exception("File upload chưa hoàn tất.");

            asset.SubmissionId = submissionId;
            _assetRepository.Update(asset);
        }

        private async Task<Teams> GetLeaderTeamAsync(Guid teamId, Guid userId)
        {
            var team = await _teamRepository.GetByIdAsync(teamId);
            if (team == null)
                throw new Exception($"Không tìm thấy đội với id: {teamId}");

            if (team.TeamLeaderId != userId)
                throw new Exception("Chỉ trưởng nhóm mới có thể upload file bài nộp.");

            return team;
        }

        private async Task<Rounds> GetOpenRoundAsync(Guid roundId, Teams team)
        {
            var round = await _roundRepository.GetByIdAsync(roundId);
            if (round == null)
                throw new Exception($"Không tìm thấy vòng thi với id: {roundId}");

            if (team.EventId != null && team.EventId != round.EventId)
                throw new Exception("Vòng thi không thuộc sự kiện của đội.");

            await _roundEligibilityService.EnsureTeamCanParticipateAsync(team.TeamId, round);
            SubmissionMutationPolicy.EnsureAllowed(round, DateTime.UtcNow);

            return round;
        }

        private void ValidateUploadFile(SignSubmissionAssetUploadRequest request, long maxFileSize)
        {
            var assetType = NormalizeAssetType(request.AssetType);
            if (request.FileSize > maxFileSize)
                throw new Exception($"Dung lượng file vượt quá giới hạn cho phép: {maxFileSize} bytes.");

            if (assetType == VideoAssetType)
            {
                var extension = Path.GetExtension(request.FileName);
                var isAllowedExt = new[] { ".mp4", ".webm", ".mov" }.Contains(extension, StringComparer.OrdinalIgnoreCase);
                var isAllowedMime = VideoContentTypes.Contains(request.ContentType) || 
                                    string.Equals(request.ContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase) ||
                                    string.IsNullOrWhiteSpace(request.ContentType);

                if (!isAllowedExt && !isAllowedMime)
                    throw new Exception("Video demo phải có định dạng mp4, webm, hoặc mov.");
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
                    throw new Exception("Slide tài liệu phải có định dạng ppt, pptx, doc, hoặc docx.");
                return;
            }

            throw new Exception("Loại file không được hỗ trợ.");
        }

        private static void ValidateCompletedAsset(SubmissionAssets asset, CompleteSubmissionAssetUploadRequest request)
        {
            if (!string.Equals(asset.ResourceType, request.ResourceType, StringComparison.OrdinalIgnoreCase))
                throw new Exception("Loại file Cloudinary không khớp với upload đã ký.");

            if (string.IsNullOrWhiteSpace(request.PublicId) || !request.PublicId.StartsWith(asset.PublicId, StringComparison.OrdinalIgnoreCase))
                throw new Exception("Public ID Cloudinary không khớp với upload đã ký.");

            if (request.FileSize <= 0)
                throw new Exception("Dung lượng file Cloudinary không hợp lệ.");
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
                throw new Exception("Cloudinary:CloudName chỉ được chứa chữ cái, số, gạch ngang, hoặc gạch dưới.");

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
            throw new Exception("AssetType phải là VideoDemo hoặc SlideDocument.");
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
