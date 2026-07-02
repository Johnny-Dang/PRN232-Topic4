using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using BusinessLogicLayer.Helpers;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IGenericRepository<RefreshTokens> _refreshTokenRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        private static readonly string[] CoordinatorAllowedRoles = new[] { "TeamMember", "TeamLeader", "Mentor", "Judge", "EventCoordinator", "Researcher" };

        public UserService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _userRepository = _unitOfWork.GetRepository<Users>();
            _refreshTokenRepository = _unitOfWork.GetRepository<RefreshTokens>();
            _configuration = configuration;
        }

        public async Task<UserDto> RegisterAsync(RegisterRequest request)
        {
            var existing = (await _userRepository.FindAsync(u => u.Email == request.Email)).FirstOrDefault();
            if (existing != null)
                throw new Exception("Email already registered");

            var user = new Users
            {
                UserId = Guid.NewGuid(),
                Email = request.Email,
                Password = PasswordHasher.Hash(request.Password),
                FullName = request.FullName,
                Phone = request.Phone,
                Role = "TeamMember",
                AccountStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };

            var created = await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(created);
        }

        public async Task<UserDto> CreateByCoordinatorAsync(CreateUserRequest request)
        {
            if (!CoordinatorAllowedRoles.Contains(request.Role))
                throw new Exception("Role not allowed for coordinator creation");

            var existing = (await _userRepository.FindAsync(u => u.Email == request.Email)).FirstOrDefault();
            if (existing != null)
                throw new Exception("Email already registered");

            var user = new Users
            {
                UserId = Guid.NewGuid(),
                Email = request.Email,
                Password = PasswordHasher.Hash(request.Password),
                FullName = request.FullName,
                Phone = request.Phone,
                Role = request.Role,
                AccountStatus = "Active",
                CreatedAt = DateTime.UtcNow
            };

            var created = await _userRepository.AddAsync(user);
            await _unitOfWork.SaveChangesAsync();

            return MapToDto(created);
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = (await _userRepository.FindAsync(u => u.Email == request.Email)).FirstOrDefault();
            if (user == null) throw new Exception("Invalid credentials");
            if (!PasswordHasher.Verify(request.Password, user.Password)) throw new Exception("Invalid credentials");

            // Revoke all existing refresh tokens for this user
            await RevokeAllUserRefreshTokensAsync(user.UserId);

            var accessToken = GenerateJwtToken(user, out DateTime accessTokenExpiresAt);
            var refreshToken = await GenerateRefreshTokenAsync(user.UserId);

            // Save all changes to database
            await _unitOfWork.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.Token,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshTokenExpiresAt = refreshToken.ExpiresAt,
                User = MapToDto(user)
            };
        }

        public async Task<UserDto?> GetByIdAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;
            return MapToDto(user);
        }

        public async Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
        {
            var refreshToken = (await _refreshTokenRepository.FindAsync(rt => rt.Token == request.RefreshToken))
                .FirstOrDefault();

            if (refreshToken == null || !refreshToken.IsActive)
                throw new Exception("Invalid or expired refresh token");

            var user = await _userRepository.GetByIdAsync(refreshToken.UserId);
            if (user == null) throw new Exception("User not found");

            // Revoke the used refresh token
            refreshToken.RevokedAt = DateTime.UtcNow;
            _refreshTokenRepository.Update(refreshToken);

            // Generate new tokens
            var accessToken = GenerateJwtToken(user, out DateTime accessTokenExpiresAt);
            var newRefreshToken = await GenerateRefreshTokenAsync(user.UserId);

            await _unitOfWork.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = newRefreshToken.Token,
                AccessTokenExpiresAt = accessTokenExpiresAt,
                RefreshTokenExpiresAt = newRefreshToken.ExpiresAt,
                User = MapToDto(user)
            };
        }

        public async Task<bool> RevokeRefreshTokenAsync(string refreshToken)
        {
            var token = (await _refreshTokenRepository.FindAsync(rt => rt.Token == refreshToken))
                .FirstOrDefault();

            if (token == null || !token.IsActive)
                return false;

            token.RevokedAt = DateTime.UtcNow;
            _refreshTokenRepository.Update(token);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        private string GenerateJwtToken(Users user, out DateTime expiresAt)
        {
            var jwt = _configuration.GetSection("Jwt");
            var secret = jwt["Secret"] ?? throw new Exception("JWT Secret not configured");
            var issuer = jwt["Issuer"] ?? "seal";
            var audience = jwt["Audience"] ?? "seal_audience";

            Console.WriteLine($"[BLL UserService] JWT Secret used for signing: '{secret}'");
            Console.WriteLine($"[BLL UserService] JWT Issuer used for signing: '{issuer}'");
            var expiryMinutes = 60;
            var expiryStr = jwt["AccessTokenExpiryMinutes"];
            if (!string.IsNullOrEmpty(expiryStr) && int.TryParse(expiryStr, out var em)) expiryMinutes = em;

            expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(ClaimTypes.MobilePhone, user.Phone)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(issuer, audience, claims, expires: expiresAt, signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<RefreshTokens> GenerateRefreshTokenAsync(Guid userId)
        {
            var jwt = _configuration.GetSection("Jwt");
            var expiryDays = 7;
            var expiryStr = jwt["RefreshTokenExpiryDays"];
            if (!string.IsNullOrEmpty(expiryStr) && int.TryParse(expiryStr, out var ed)) expiryDays = ed;

            var refreshToken = new RefreshTokens
            {
                RefreshTokenId = Guid.NewGuid(),
                Token = GenerateSecureRandomToken(),
                UserId = userId,
                ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
                CreatedAt = DateTime.UtcNow
            };

            await _refreshTokenRepository.AddAsync(refreshToken);
            return refreshToken;
        }

        private static string GenerateSecureRandomToken()
        {
            using var rng = RandomNumberGenerator.Create();
            var randomBytes = new byte[64];
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes);
        }

        private async Task RevokeAllUserRefreshTokensAsync(Guid userId)
        {
            var userTokens = await _refreshTokenRepository.FindAsync(rt => rt.UserId == userId && rt.RevokedAt == null);
            foreach (var token in userTokens)
            {
                token.RevokedAt = DateTime.UtcNow;
                _refreshTokenRepository.Update(token);
            }
        }

        private static UserDto MapToDto(Users u)
        {
            return new UserDto
            {
                UserId = u.UserId,
                Email = u.Email,
                FullName = u.FullName,
                Phone = u.Phone,
                Role = u.Role,
                AccountStatus = u.AccountStatus,
                CreatedAt = u.CreatedAt
            };
        }
    }
}
