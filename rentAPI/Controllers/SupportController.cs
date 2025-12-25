using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.Models;
using System.Security.Claims;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SupportController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<SupportController> _logger;

        public SupportController(AppDbContext context, ILogger<SupportController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeedback([FromBody] CreateFeedbackDto feedbackDto)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { 
                        success = false, 
                        message = "Неверный токен" 
                    });
                }

                // Проверяем существование пользователя
                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                {
                    return NotFound(new { 
                        success = false, 
                        message = "Пользователь не найден" 
                    });
                }

                // Создаем новое обращение
                var feedback = new Feedback
                {
                    UserId = userId,
                    Topic = feedbackDto.Topic,
                    Text = feedbackDto.Text,
                    CreatedAt = DateTime.UtcNow
                };

                // Сохраняем в базу данных
                await _context.Feedback.AddAsync(feedback);
                await _context.SaveChangesAsync();

                // Логируем создание обращения
                _logger.LogInformation("Новое обращение в поддержку создано: ID={FeedbackId}, UserID={UserId}, Topic={Topic}", 
                    feedback.Id, userId, feedbackDto.Topic);

                return Ok(new { 
                    success = true, 
                    message = "Обращение успешно отправлено в поддержку",
                    feedbackId = feedback.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании обращения в поддержку");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера при создании обращения" 
                });
            }
        }

        [HttpGet("my-feedback")]
        public async Task<IActionResult> GetMyFeedback()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { 
                        success = false, 
                        message = "Неверный токен" 
                    });
                }

                // Получаем все обращения пользователя
                var feedback = await _context.Feedback
                    .Where(f => f.UserId == userId)
                    .OrderByDescending(f => f.CreatedAt)
                    .Select(f => new
                    {
                        f.Id,
                        f.Topic,
                        f.Text,
                        f.CreatedAt,
                        User = new
                        {
                            f.User.Fio,
                            f.User.Email
                        }
                    })
                    .ToListAsync();

                return Ok(new { 
                    success = true, 
                    data = feedback 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении обращений пользователя");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера" 
                });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")] // Только для администраторов
        public async Task<IActionResult> GetAllFeedback()
        {
            try
            {
                var feedback = await _context.Feedback
                    .Include(f => f.User)
                    .OrderByDescending(f => f.CreatedAt)
                    .Select(f => new
                    {
                        f.Id,
                        f.Topic,
                        f.Text,
                        f.CreatedAt,
                        User = new
                        {
                            f.User.Id,
                            f.User.Fio,
                            f.User.Email,
                            f.User.Phone_num
                        }
                    })
                    .ToListAsync();

                return Ok(new { 
                    success = true, 
                    data = feedback 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении всех обращений");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера" 
                });
            }
        }

        [HttpDelete("{id}")]
        [Authorize] // Для всех авторизованных пользователей (и пользователей, и администраторов)
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { 
                        success = false, 
                        message = "Неверный токен" 
                    });
                }

                var feedback = await _context.Feedback.FindAsync(id);
                if (feedback == null)
                {
                    return NotFound(new { 
                        success = false, 
                        message = "Обращение не найдено" 
                    });
                }

                // Получаем пользователя для проверки роли
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Unauthorized(new { 
                        success = false, 
                        message = "Пользователь не найден" 
                    });
                }

                // Проверяем, может ли пользователь удалить это обращение
                bool canDelete = false;
                
                // 1. Пользователь может удалить свое собственное обращение
                if (feedback.UserId == userId)
                {
                    canDelete = true;
                }
                // 2. Администратор может удалить любое обращение
                else if (User.IsInRole("Admin"))
                {
                    canDelete = true;
                }

                if (!canDelete)
                {
                    return Forbid(); // Возвращаем 403 Forbidden
                }

                _context.Feedback.Remove(feedback);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Обращение удалено: ID={FeedbackId}, удалил пользователь ID={UserId}", 
                    id, userId);

                return Ok(new { 
                    success = true, 
                    message = "Обращение успешно удалено" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении обращения");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера" 
                });
            }
        }

        [HttpDelete("my/{id}")]
        [Authorize] // Только для удаления собственных обращений
        public async Task<IActionResult> DeleteMyFeedback(int id)
        {
            try
            {
                // Получаем ID пользователя из токена
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { 
                        success = false, 
                        message = "Неверный токен" 
                    });
                }

                // Находим обращение, принадлежащее текущему пользователю
                var feedback = await _context.Feedback
                    .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

                if (feedback == null)
                {
                    return NotFound(new { 
                        success = false, 
                        message = "Обращение не найдено или у вас нет прав на его удаление" 
                    });
                }

                _context.Feedback.Remove(feedback);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Пользователь удалил свое обращение: FeedbackID={FeedbackId}, UserID={UserId}", 
                    id, userId);

                return Ok(new { 
                    success = true, 
                    message = "Ваше обращение успешно удалено" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении обращения пользователем");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера" 
                });
            }
        }
    }
}