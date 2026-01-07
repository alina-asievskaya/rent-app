using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.Models;
using RentApp.API.Services;
using System.Security.Claims;

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

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _context.Users
                    .Where(u => u.Email.ToLower() != "admin@gmail.com")
                    .Select(u => new
                    {
                        u.Id,
                        u.Email,
                        u.Fio,
                        u.Phone_num,
                        u.Id_agent
                    })
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
                if (user == null)
                {
                    return NotFound(new { success = false, message = "Пользователь не найден" });
                }

                if (user.Email.ToLower() == "admin@gmail.com")
                {
                    return BadRequest(new { success = false, message = "Нельзя удалить администратора" });
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Пользователь удален администратором: UserID={UserId}", id);
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
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email.ToLower() == agentDto.Email.ToLower());

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
                    
                    if (!success)
                    {
                        return BadRequest(new { success = false, message });
                    }

                    userId = newUserId ?? 0;

                    var user = await _context.Users.FindAsync(userId);
                    if (user != null)
                    {
                        user.Id_agent = true;
                        await _context.SaveChangesAsync();
                    }
                }
                else
                {
                    userId = existingUser.Id;
                    existingUser.Id_agent = true;
                    await _context.SaveChangesAsync();
                }

                // Если есть URL фото из Cloudinary, используем его
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

                return Ok(new { 
                    success = true, 
                    message = "Агент успешно создан",
                    agentId = agent.Id,
                    photoUrl = photoUrl
                });
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
                        User = new
                        {
                            a.User.Id,
                            a.User.Email,
                            a.User.Fio,
                            a.User.Phone_num
                        }
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
                var agent = await _context.Agents
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (agent == null)
                {
                    return NotFound(new { success = false, message = "Агент не найден" });
                }

                agent.User.Id_agent = false;
                _context.Agents.Remove(agent);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Агент удален: AgentID={AgentId}, UserID={UserId}", id, agent.UserId);
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
                        User = new
                        {
                            f.User.Id,
                            f.User.Fio,
                            f.User.Email,
                            f.User.Phone_num
                        }
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
                if (feedback == null)
                {
                    return NotFound(new { success = false, message = "Обращение не найдено" });
                }

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
                var totalUsers = await _context.Users
                    .Where(u => u.Email.ToLower() != "admin@gmail.com")
                    .CountAsync();

                var totalAgents = await _context.Agents.CountAsync();
                
                var activeUsers = await _context.Users
                    .Where(u => u.Email.ToLower() != "admin@gmail.com")
                    .CountAsync();

                var totalFeedback = await _context.Feedback.CountAsync();

                return Ok(new 
                { 
                    success = true, 
                    data = new
                    {
                        totalUsers,
                        totalAgents,
                        activeUsers,
                        totalFeedback
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении статистики");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }
    }
}