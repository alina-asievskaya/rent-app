// RentApp.API/Controllers/AdminController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.Models;
using RentApp.API.Services;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IAuthService _authService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(AppDbContext context, IAuthService authService, ILogger<AdminController> logger)
        {
            _context = context;
            _authService = authService;
            _logger = logger;
        }

        // ========== Существующие методы (без изменений) ==========
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.Email.ToLower() != "admin@gmail.com")
                    .Select(u => new { u.Id, u.Email, u.Fio, u.Phone_num, u.Id_agent })
                    .OrderByDescending(u => u.Id)
                    .ToListAsync();
                return Ok(new { success = true, data = users });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении пользователей");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null) return NotFound(new { success = false, message = "Пользователь не найден" });
                if (user.Email.ToLower() == "admin@gmail.com") return BadRequest(new { success = false, message = "Нельзя удалить администратора" });

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Пользователь удален: UserID={UserId}", id);
                return Ok(new { success = true, message = "Пользователь успешно удален" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении пользователя");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost("agents")]
        public async Task<IActionResult> CreateAgent([FromBody] CreateAgentDto agentDto)
        {
            try
            {
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == agentDto.Email.ToLower());
                int userId;
                if (existingUser == null)
                {
                    var registerDto = new RegisterDto
                    {
                        Email = agentDto.Email,
                        Fio = agentDto.Fio,
                        Password = agentDto.Password,
                        ConfirmPassword = agentDto.Password,
                        Phone_num = agentDto.Phone_num
                    };
                    var (success, message, newUserId) = await _authService.RegisterAsync(registerDto);
                    if (!success) return BadRequest(new { success = false, message });
                    userId = newUserId ?? 0;
                    var user = await _context.Users.FindAsync(userId);
                    if (user != null) user.Id_agent = true;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    userId = existingUser.Id;
                    existingUser.Id_agent = true;
                    await _context.SaveChangesAsync();
                }

                string photoUrl = !string.IsNullOrEmpty(agentDto.Photo) ? agentDto.Photo : "";
                var agent = new Agent
                {
                    UserId = userId,
                    Specialization = agentDto.Specialization,
                    Experience = agentDto.Experience,
                    Photo = photoUrl,
                    Rating = agentDto.Rating
                };
                await _context.Agents.AddAsync(agent);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, message = "Агент успешно создан", agentId = agent.Id, photoUrl });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании агента");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("agents")]
        public async Task<IActionResult> GetAllAgents()
        {
            try
            {
                var agents = await _context.Agents
                    .Include(a => a.User)
                    .Select(a => new
                    {
                        a.Id,
                        a.UserId,
                        a.Specialization,
                        a.Experience,
                        a.Photo,
                        a.Rating,
                        User = new { a.User.Id, a.User.Email, a.User.Fio, a.User.Phone_num }
                    })
                    .OrderByDescending(a => a.Id)
                    .ToListAsync();
                return Ok(new { success = true, data = agents });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении агентов");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("agents/{id}")]
        public async Task<IActionResult> DeleteAgent(int id)
        {
            try
            {
                var agent = await _context.Agents.Include(a => a.User).FirstOrDefaultAsync(a => a.Id == id);
                if (agent == null) return NotFound(new { success = false, message = "Агент не найден" });

                agent.User.Id_agent = false;
                _context.Agents.Remove(agent);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Агент удален: AgentID={AgentId}", id);
                return Ok(new { success = true, message = "Агент успешно удален" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении агента");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("feedback")]
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
                        User = new { f.User.Id, f.User.Fio, f.User.Email, f.User.Phone_num }
                    })
                    .ToListAsync();
                return Ok(new { success = true, data = feedback });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении обращений");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("feedback/{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            try
            {
                var feedback = await _context.Feedback.FindAsync(id);
                if (feedback == null) return NotFound(new { success = false, message = "Обращение не найдено" });

                _context.Feedback.Remove(feedback);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Обращение успешно удалено" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении обращения");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            try
            {
                var totalUsers = await _context.Users.Where(u => u.Email.ToLower() != "admin@gmail.com").CountAsync();
                var totalAgents = await _context.Agents.CountAsync();
                var activeUsers = totalUsers;
                var totalFeedback = await _context.Feedback.CountAsync();
                return Ok(new { success = true, data = new { totalUsers, totalAgents, activeUsers, totalFeedback } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении статистики");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        // ========== Методы для управления заявками на услуги ==========
        [HttpGet("service-requests")]
        public async Task<IActionResult> GetOffers()
        {
            try
            {
                var requests = await _context.ServiceRequests
                    .Include(r => r.User)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new OfferResponseDto
                    {
                        Id = r.Id,
                        UserId = r.UserId,
                        UserFio = r.User!.Fio,
                        UserEmail = r.User.Email,
                        Phone = r.Phone,
                        ServiceType = r.ServiceType,
                        CompanyName = r.CompanyName,
                        City = r.City,
                        Description = r.Description,
                        Status = r.Status,
                        CreatedAt = r.CreatedAt
                    })
                    .ToListAsync();
                return Ok(new { success = true, data = requests });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении заявок");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        // ИЗМЕНЕННЫЙ МЕТОД: теперь при одобрении создаётся CateringOwner и уведомление
        [HttpPut("service-requests/{id}/status")]
        public async Task<IActionResult> UpdateOfferStatus(int id, [FromBody] UpdateOfferStatusDto dto)
        {
            try
            {
                var request = await _context.ServiceRequests
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);
                if (request == null)
                    return NotFound(new { success = false, message = "Заявка не найдена" });
                if (dto.Status != "approved" && dto.Status != "rejected")
                    return BadRequest(new { success = false, message = "Некорректный статус. Допустимые значения: approved, rejected" });

                request.Status = dto.Status;
                await _context.SaveChangesAsync();

                // Создаём уведомление для пользователя
                var notification = new Notification
                {
                    UserId = request.UserId,
                    Type = "cateringRequest",
                    ReferenceId = request.Id,
                    Text = dto.Status == "approved"
                        ? "Ваша заявка на кейтеринг одобрена! Теперь вы можете управлять меню в профиле."
                        : "Ваша заявка на кейтеринг отклонена. Причина: несоответствие требованиям.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(notification);

                // Если заявка одобрена и пользователь ещё не является владельцем кейтеринга, создаём запись в CateringOwners
                if (dto.Status == "approved")
                {
                    var existingOwner = await _context.CateringOwners
                        .FirstOrDefaultAsync(co => co.UserId == request.UserId);
                    if (existingOwner == null)
                    {
                        var cateringOwner = new CateringOwner
                        {
                            UserId = request.UserId,
                            CompanyName = request.CompanyName,
                            City = request.City,
                            Description = request.Description,
                            Phone = request.Phone,
                            CreatedAt = DateTime.UtcNow,
                            IsActive = true
                        };
                        _context.CateringOwners.Add(cateringOwner);
                    }
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Статус заявки {RequestId} изменён на {Status}", id, dto.Status);

                return Ok(new { success = true, message = $"Статус изменён на {dto.Status}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении статуса заявки {RequestId}", id);
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("service-requests/{id}")]
        public async Task<IActionResult> DeleteOffer(int id)
        {
            try
            {
                var request = await _context.ServiceRequests.FindAsync(id);
                if (request == null) return NotFound(new { success = false, message = "Заявка не найдена" });

                _context.ServiceRequests.Remove(request);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Заявка {RequestId} удалена", id);
                return Ok(new { success = true, message = "Заявка удалена" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении заявки {RequestId}", id);
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }
    }
}