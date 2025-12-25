using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.Services;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;

        public AuthController(IAuthService authService, AppDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            Console.WriteLine($"Регистрация: Email={registerDto.Email}, FIO={registerDto.Fio}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine($"Ошибки валидации: {string.Join(", ", ModelState.Values.SelectMany(v => v.Errors))}");
                return BadRequest(new { 
                    success = false, 
                    message = "Некорректные данные", 
                    errors = ModelState.Values.SelectMany(v => v.Errors) 
                });
            }

            try
            {
                var (success, message, userId) = await _authService.RegisterAsync(registerDto);
                Console.WriteLine($"Результат регистрации: Success={success}, Message={message}, UserId={userId}");

                if (success)
                {
                    return Ok(new { 
                        success = true, 
                        message = message,
                        userId = userId 
                    });
                }
                else
                {
                    return BadRequest(new { 
                        success = false, 
                        message = message 
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Исключение при регистрации: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера" 
                });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { 
                    success = false, 
                    message = "Некорректные данные" 
                });
            }

            var (success, message, response) = await _authService.LoginAsync(loginDto);

            if (success && response != null)
            {
                return Ok(new { 
                    success = true, 
                    message = message,
                    data = response 
                });
            }
            else
            {
                return Unauthorized(new { 
                    success = false, 
                    message = message 
                });
            }
        }

        [HttpGet("check-email/{email}")]
        public async Task<IActionResult> CheckEmail(string email)
        {
            var exists = await _context.Users.AnyAsync(u => u.Email == email);
            return Ok(new { 
                exists = exists 
            });
        }

        // === НОВЫЕ МЕТОДЫ ДЛЯ ЛИЧНОГО КАБИНЕТА ===

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Неверный токен" });
                }

                var user = await _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => new
                    {
                        u.Id,
                        u.Email,
                        u.Fio,
                        u.Phone_num,
                        u.Id_agent
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    return NotFound(new { success = false, message = "Пользователь не найден" });
                }

                return Ok(user);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при получении пользователя: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPut("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { success = false, message = "Неверный токен" });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Пользователь не найден" });
                }

                // Проверка уникальности телефона
                if (!string.IsNullOrEmpty(updateDto.Phone_num) && 
                    updateDto.Phone_num != user.Phone_num)
                {
                    var existingPhone = await _context.Users
                        .AnyAsync(u => u.Phone_num == updateDto.Phone_num && u.Id != userId);
                    
                    if (existingPhone)
                    {
                        return BadRequest(new { success = false, message = "Этот номер телефона уже используется" });
                    }
                }

                // Обновляем только разрешенные поля
                if (!string.IsNullOrEmpty(updateDto.Fio))
                {
                    user.Fio = updateDto.Fio;
                }
                
                if (!string.IsNullOrEmpty(updateDto.Phone_num))
                {
                    user.Phone_num = updateDto.Phone_num;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    user.Id,
                    user.Email,
                    user.Fio,
                    user.Phone_num,
                    user.Id_agent
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при обновлении профиля: {ex.Message}");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }
    }
}