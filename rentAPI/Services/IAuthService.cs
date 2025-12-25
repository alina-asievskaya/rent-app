using RentApp.API.DTOs;
using RentApp.API.Models; 

namespace RentApp.API.Services
{
    public interface IAuthService
    {
        Task<(bool success, string message, int? userId)> RegisterAsync(RegisterDto registerDto);
        Task<(bool success, string message, LoginResponseDto? response)> LoginAsync(LoginDto loginDto);
        string GenerateJwtToken(User user);
    }
}