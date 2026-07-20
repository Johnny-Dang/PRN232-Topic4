using BusinessLogicLayer.DTOs.Requests;
using BusinessLogicLayer.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserDto> RegisterAsync(RegisterRequest request);
        Task<UserDto> CreateByCoordinatorAsync(CreateUserRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request);
        Task<bool> RevokeRefreshTokenAsync(string refreshToken);
        Task<UserDto?> GetByIdAsync(System.Guid userId);
        Task<List<UserDto>> GetAllAsync();
        Task<List<UserDto>> GetByRoleAsync(string role);
        Task<List<UserDto>> SearchUsersAsync(string query);
    }
}
