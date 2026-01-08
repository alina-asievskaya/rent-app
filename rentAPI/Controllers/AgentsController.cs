using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentApp.API.DTOs;
using RentApp.API.Services;
using System.Security.Claims;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgentsController : ControllerBase
    {
        private readonly IAgentService _agentService;
        private readonly ILogger<AgentsController> _logger;

        public AgentsController(IAgentService agentService, ILogger<AgentsController> logger)
        {
            _agentService = agentService;
            _logger = logger;
        }

        [HttpGet("catalog")]
        public async Task<IActionResult> GetCatalog([FromQuery] AgentFilterDto filter)
        {
            try
            {
                _logger.LogInformation("=== НАЧАЛО ЗАПРОСА АГЕНТОВ ===");
                _logger.LogInformation("Фильтры: Search={Search}, Specialty={Specialty}, Experience={Experience}, Rating={Rating}, SortBy={SortBy}", 
                    filter.Search, filter.Specialty, filter.Experience, filter.Rating, filter.SortBy);
                
                var result = await _agentService.GetAgentsAsync(filter);
                
                _logger.LogInformation("Успешно получено {Count} агентов", result.Agents.Count);
                _logger.LogInformation("=== КОНЕЦ ЗАПРОСА АГЕНТОВ ===");
                
                return Ok(new { 
                    success = true, 
                    data = result,
                    message = $"Найдено {result.Agents.Count} агентов"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "=== ОШИБКА В GetCatalog ===");
                _logger.LogError("Message: {Message}", ex.Message);
                _logger.LogError("StackTrace: {StackTrace}", ex.StackTrace);
                
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner Exception: {Message}", ex.InnerException.Message);
                }
                
                _logger.LogError("=== КОНЕЦ ОШИБКИ ===");
                
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера при получении данных агентов",
                    detailed = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAgent(int id)
        {
            try
            {
                var agent = await _agentService.GetAgentByIdAsync(id);
                if (agent == null)
                    return NotFound(new { success = false, message = "Агент не найден" });

                return Ok(new { success = true, data = agent });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении агента с ID {Id}", id);
                return StatusCode(500, new { 
                    success = false, 
                    message = "Ошибка сервера",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("profile/{id}")]
        public async Task<IActionResult> GetAgentProfile(int id)
        {
            try
            {
                _logger.LogInformation("Получение профиля агента с ID {Id}", id);
                
                var agent = await _agentService.GetAgentByIdAsync(id);
                if (agent == null)
                    return NotFound(new { success = false, message = "Агент не найден" });

                return Ok(new { 
                    success = true, 
                    data = agent,
                    message = "Профиль агента успешно загружен"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении профиля агента с ID {Id}", id);
                return StatusCode(500, new { 
                    success = false, 
                    message = "Ошибка сервера при загрузке профиля",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("{id}/reviews")]
        public async Task<IActionResult> GetAgentReviews(int id)
        {
            try
            {
                var reviews = await _agentService.GetAgentReviewsAsync(id);
                return Ok(new { 
                    success = true, 
                    data = reviews,
                    message = $"Найдено {reviews.Count} отзывов"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отзывов агента с ID {Id}", id);
                return StatusCode(500, new { 
                    success = false, 
                    message = "Ошибка сервера при получении отзывов",
                    error = ex.Message 
                });
            }
        }

        [HttpPost("{id}/reviews")]
        [Authorize]
        public async Task<IActionResult> AddAgentReview(int id, [FromBody] CreateAgentReviewDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { 
                        success = false, 
                        message = "Неверные данные", 
                        errors = ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage) 
                    });

                // Получаем ID текущего пользователя из токена
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                var roleClaim = User.FindFirst(ClaimTypes.Role); // Добавляем получение роли
                
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId) || userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });
                
                // Проверяем, не является ли пользователь администратором
                if (roleClaim != null && roleClaim.Value == "Admin")
                    return BadRequest(new { 
                        success = false, 
                        message = "Администраторы не могут оставлять отзывы" 
                    });

                var result = await _agentService.AddAgentReviewAsync(id, userId, createDto);
                
                if (!result)
                    return BadRequest(new { success = false, message = "Не удалось добавить отзыв" });

                return Ok(new { 
                    success = true, 
                    message = "Отзыв успешно добавлен"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при добавлении отзыва агенту с ID {Id}", id);
                return StatusCode(500, new { 
                    success = false, 
                    message = "Ошибка сервера при добавлении отзыва",
                    error = ex.Message 
                });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateAgent([FromBody] CreateAgentDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { 
                        success = false, 
                        message = "Неверные данные", 
                        errors = ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage) 
                    });

                var result = await _agentService.CreateAgentAsync(createDto);
                if (!result)
                    return BadRequest(new { success = false, message = "Не удалось создать агента" });

                return Ok(new { 
                    success = true, 
                    message = "Агент успешно создан",
                    data = createDto 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании агента");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Ошибка сервера при создании агента",
                    error = ex.Message 
                });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateAgent(int id, [FromBody] UpdateAgentDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(new { 
                        success = false, 
                        message = "Неверные данные", 
                        errors = ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage) 
                    });

                var result = await _agentService.UpdateAgentAsync(id, updateDto);
                if (!result)
                    return NotFound(new { success = false, message = "Агент не найден" });

                return Ok(new { 
                    success = true, 
                    message = "Данные агента успешно обновлены",
                    agentId = id 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении агента с ID {Id}", id);
                return StatusCode(500, new { 
                    success = false, 
                    message = "Ошибка сервера при обновлении данных",
                    error = ex.Message 
                });
            }
        }

        [HttpGet("specialties")]
        public async Task<IActionResult> GetSpecialties()
        {
            try
            {
                var specialties = await _agentService.GetSpecialtiesAsync();
                return Ok(new { success = true, data = specialties });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка специализаций");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Ошибка сервера",
                    error = ex.Message 
                });
            }
        }
    }
}