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
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implements
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<Users> _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        private static readonly string[] CoordinatorAllowedRoles = new[] { "TeamMember", "TeamLeader", "Mentor", "Judge", "EventCoordinator" };

        public UserService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _userRepository = _unitOfWork.GetRepository<Users>();
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

            var token = GenerateJwtToken(user, out DateTime expiresAt);

            return new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = MapToDto(user)
            };
        }

        public async Task<UserDto?> GetByIdAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;
            return MapToDto(user);
        }

        private string GenerateJwtToken(Users user, out DateTime expiresAt)
        {
            var jwt = _configuration.GetSection("Jwt");
            var secret = jwt["Secret"] ?? throw new Exception("JWT Secret not configured");
            var issuer = jwt["Issuer"] ?? "seal";
            var audience = jwt["Audience"] ?? "seal_audience";
            var expiryMinutes = 60;
            var expiryStr = jwt["ExpiryMinutes"];
            if (!string.IsNullOrEmpty(expiryStr) && int.TryParse(expiryStr, out var em)) expiryMinutes = em;

            expiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes);

            var claims = new[] {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(issuer, audience, claims, expires: expiresAt, signingCredentials: creds);
            return new JwtSecurityTokenHandler().WriteToken(token);
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
