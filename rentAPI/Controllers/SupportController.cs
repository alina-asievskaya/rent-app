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
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { 
                        success = false, 
                        message = "Неверный токен" 
                    });
                }

                var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
                if (!userExists)
                {
                    return NotFound(new { 
                        success = false, 
                        message = "Пользователь не найден" 
                    });
                }

                var feedback = new Feedback
                {
                    UserId = userId,
                    Topic = feedbackDto.Topic,
                    Text = feedbackDto.Text,
                    CreatedAt = DateOnly.FromDateTime(DateTime.Now)
                };

                await _context.Feedback.AddAsync(feedback);
                await _context.SaveChangesAsync();

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
        [HttpPost("{feedbackId}/reply")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ReplyToFeedback(int feedbackId, [FromBody] CreateSupportReplyDto replyDto)
        {
            try
            {
                var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminIdClaim) || !int.TryParse(adminIdClaim, out int adminId))
                {
                    return Unauthorized(new { success = false, message = "Неверный токен" });
                }

                var feedback = await _context.Feedback.FindAsync(feedbackId);
                if (feedback == null)
                {
                    return NotFound(new { success = false, message = "Обращение не найдено" });
                }

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
        [Authorize] 
        public async Task<IActionResult> DeleteFeedback(int id)
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

                var feedback = await _context.Feedback.FindAsync(id);
                if (feedback == null)
                {
                    return NotFound(new { 
                        success = false, 
                        message = "Обращение не найдено" 
                    });
                }

                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return Unauthorized(new { 
                        success = false, 
                        message = "Пользователь не найден" 
                    });
                }

                bool canDelete = false;
                
                if (feedback.UserId == userId)
                {
                    canDelete = true;
                }
                else if (User.IsInRole("Admin"))
                {
                    canDelete = true;
                }

                if (!canDelete)
                {
                    return Forbid(); 
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
        [Authorize] 
        public async Task<IActionResult> DeleteMyFeedback(int id)
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