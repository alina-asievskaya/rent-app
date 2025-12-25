using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.Models;
using RentApp.API.Services;

namespace RentApp.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<(bool success, string message, int? userId)> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Проверка существующего email
                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                {
                    return (false, "Пользователь с таким email уже существует", null);
                }

                // Проверка существующего телефона
                if (await _context.Users.AnyAsync(u => u.Phone_num == registerDto.Phone_num))
                {
                    return (false, "Пользователь с таким номером телефона уже существует", null);
                }

                // Хеширование пароля
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

                // Создание пользователя
                var user = new User
                {
                    Email = registerDto.Email,
                    Fio = registerDto.Fio,
                    Password = passwordHash,
                    Phone_num = registerDto.Phone_num,
                    Id_agent = false,
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                return (true, "Регистрация прошла успешно", user.Id);
            }
            catch (Exception ex)
            {
                return (false, $"Ошибка: {ex.Message}", null);
            }
        }

        public async Task<(bool success, string message, LoginResponseDto? response)> LoginAsync(LoginDto loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null)
                {
                    return (false, "Неверный email или пароль", null);
                }

                if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
                {
                    return (false, "Неверный email или пароль", null);
                }

                var token = GenerateJwtToken(user);

                var response = new LoginResponseDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Fio = user.Fio,
                    Phone_num = user.Phone_num,
                    Id_agent = user.Id_agent,
                    Token = token
                };

                return (true, "Вход выполнен успешно", response);
            }
            catch (Exception ex)
            {
                return (false, $"Ошибка: {ex.Message}", null);
            }
        }

        public string GenerateJwtToken(User user)
{
    var jwtSettings = _configuration.GetSection("JwtSettings");
    
    var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);
    
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // user.Id
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Name, user.Fio),
        new Claim("Phone", user.Phone_num),
        new Claim("IsAgent", user.Id_agent.ToString())
    };

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddDays(7),
        Issuer = jwtSettings["Issuer"],
        Audience = jwtSettings["Audience"],
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature)
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);
    
    return tokenHandler.WriteToken(token);
}
    }
}