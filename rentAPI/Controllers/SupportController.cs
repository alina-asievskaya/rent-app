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
                    CreatedAt = DateOnly.FromDateTime(DateTime.Now)
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
        // POST: api/support/{feedbackId}/reply (только для администратора)
        [HttpPost("{feedbackId}/reply")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReplyToFeedback(int feedbackId, [FromBody] CreateSupportReplyDto replyDto)
        {
            try
            {
                // Получаем ID администратора из токена
                var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminIdClaim) || !int.TryParse(adminIdClaim, out int adminId))
                {
                    return Unauthorized(new { success = false, message = "Неверный токен" });
                }

                // Проверяем существование обращения
                var feedback = await _context.Feedback.FindAsync(feedbackId);
                if (feedback == null)
                {
                    return NotFound(new { success = false, message = "Обращение не найдено" });
                }

                // Создаём ответ
                var reply = new SupportReply
                {
                    FeedbackId = feedbackId,
                    AdminId = adminId,
                    Message = replyDto.Message,
                    CreatedAt = DateOnly.FromDateTime(DateTime.Now)
                };

                await _context.SupportReplies.AddAsync(reply);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Администратор {AdminId} ответил на обращение {FeedbackId}", adminId, feedbackId);

                return Ok(new { success = true, message = "Ответ отправлен", replyId = reply.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при добавлении ответа на обращение");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

            // GET: api/support/{feedbackId}/replies (для администратора или владельца обращения)
            [HttpGet("{feedbackId}/replies")]
            [Authorize]
            public async Task<IActionResult> GetReplies(int feedbackId)
            {
                try
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
                    {
                        return Unauthorized(new { success = false, message = "Неверный токен" });
                    }

                    var feedback = await _context.Feedback.FindAsync(feedbackId);
                    if (feedback == null)
                    {
                        return NotFound(new { success = false, message = "Обращение не найдено" });
                    }

                    // Проверяем права: администратор или владелец обращения
                    bool isAdmin = User.IsInRole("Admin");
                    if (!isAdmin && feedback.UserId != currentUserId)
                    {
                        return Forbid();
                    }

                    var replies = await _context.SupportReplies
                        .Where(r => r.FeedbackId == feedbackId)
                        .Include(r => r.Admin)
                        .OrderBy(r => r.CreatedAt)
                        .Select(r => new SupportReplyDto
                        {
                            Id = r.Id,
                            FeedbackId = r.FeedbackId,
                            AdminName = r.Admin.Fio,
                            Message = r.Message,
                            CreatedAt = r.CreatedAt
                        })
                        .ToListAsync();

                    return Ok(new { success = true, data = replies });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Ошибка при получении ответов на обращение");
                    return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
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
                    return Unauthorized(new { success = false, message = "Неверный токен" });
                }

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
                        },
                        // Включаем ответы администратора
                        Replies = f.Replies.OrderBy(r => r.CreatedAt).Select(r => new
                        {
                            r.Id,
                            r.Message,
                            r.CreatedAt,
                            AdminName = r.Admin.Fio
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(new { success = true, data = feedback });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении обращений пользователя");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllFeedback()
        {
            try
            {
                var feedback = await _context.Feedback
                    .Include(f => f.User)
                    .Include(f => f.Replies)           
                        .ThenInclude(r => r.Admin)     
                    .OrderByDescending(f => f.CreatedAt)
                    .ToListAsync();

                var result = feedback.Select(f => new
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
                    },
                    Replies = f.Replies.OrderBy(r => r.CreatedAt).Select(r => new
                    {
                        r.Id,
                        r.Message,
                        r.CreatedAt,
                        AdminName = r.Admin.Fio
                    }).ToList()
                });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении всех обращений");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
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