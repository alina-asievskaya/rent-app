using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.Models;

namespace RentApp.API.Services
{
    public class AgentService : IAgentService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AgentService> _logger;

        public AgentService(AppDbContext context, ILogger<AgentService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<AgentCatalogDto> GetAgentsAsync(AgentFilterDto filter)
        {
            try
            {
                var query = _context.Agents
                    .Include(a => a.User)
                    .Where(a => a.User.Id_agent)
                    .AsQueryable();

                // Поиск
                if (!string.IsNullOrEmpty(filter.Search))
                {
                    var search = filter.Search.ToLower();
                    query = query.Where(a =>
                        a.User.Fio.ToLower().Contains(search) ||
                        a.Specialization.ToLower().Contains(search) ||
                        (a.User.Phone_num != null && a.User.Phone_num.ToLower().Contains(search)));
                }

                // Фильтр по специализации
                if (!string.IsNullOrEmpty(filter.Specialty) && filter.Specialty != "Все")
                {
                    query = query.Where(a => a.Specialization == filter.Specialty);
                }

                // Фильтр по опыту
                if (!string.IsNullOrEmpty(filter.Experience) && filter.Experience != "Любой")
                {
                    var (minExp, maxExp) = ParseExperienceRange(filter.Experience);
                    query = query.Where(a =>
                        a.Experience >= minExp &&
                        a.Experience <= maxExp);
                }

                // Фильтр по рейтингу
                if (!string.IsNullOrEmpty(filter.Rating) && filter.Rating != "Любой")
                {
                    if (double.TryParse(filter.Rating.Replace("+", ""), out var minRating))
                    {
                        query = query.Where(a => a.Rating >= minRating);
                    }
                }

                // Сортировка
                query = filter.SortBy switch
                {
                    "rating-desc" => query.OrderByDescending(a => a.Rating),
                    "experience-desc" => query.OrderByDescending(a => a.Experience),
                    "name-asc" => query.OrderBy(a => a.User.Fio),
                    _ => query.OrderByDescending(a => a.Rating)
                };

                // Пагинация
                var totalCount = await query.CountAsync();
                var agents = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                // Получаем уникальные специализации для фильтров
                var specialties = await GetSpecialtiesAsync();

                var result = new AgentCatalogDto
                {
                    Agents = agents.Select(MapToDto).ToList(),
                    TotalCount = totalCount,
                    Filters = new Dictionary<string, List<string>>
                    {
                        ["specialties"] = specialties
                    }
                };

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка агентов");
                throw;
            }
        }

        private (int min, int max) ParseExperienceRange(string experience)
        {
            return experience switch
            {
                "1-3 года" => (1, 3),
                "3-5 лет" => (3, 5),
                "5-10 лет" => (5, 10),
                "10+ лет" => (10, 100),
                _ => (0, 100)
            };
        }

        private AgentDto MapToDto(Agent agent)
        {
            // Парсинг специализаций
            var specialties = new List<string>();
            if (!string.IsNullOrEmpty(agent.Specialization))
            {
                specialties = agent.Specialization
                    .Split(',', ';')
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();
            }

            if (specialties.Count == 0 && !string.IsNullOrEmpty(agent.Specialization))
            {
                specialties.Add(agent.Specialization);
            }

            // Создаем позицию на основе специализации
            var position = specialties.Count > 0 
                ? $"Агент по {string.Join(", ", specialties.Take(2))}"
                : "Агент по недвижимости";

            // Создаем описание
            var description = $"Специализируюсь на {string.Join(", ", specialties)}. " +
                             $"Опыт работы {agent.Experience} лет. " +
                             $"Рейтинг: {agent.Rating}/5.";

            return new AgentDto
            {
                Id = agent.Id,
                Fio = agent.User?.Fio ?? "Неизвестный агент",
                Email = agent.User?.Email ?? "",
                Phone = agent.User?.Phone_num ?? "",
                Specialization = agent.Specialization,
                Experience = agent.Experience,
                Rating = agent.Rating,
                Photo = !string.IsNullOrEmpty(agent.Photo) 
                    ? agent.Photo 
                    : GetDefaultAvatar(agent.User?.Fio ?? "Агент"),
                ReviewsCount = agent.ReviewsCount,
                Specialties = specialties,
                Description = description,
                Position = position
            };
        }

        private string GetDefaultAvatar(string name)
        {
            var hash = name.GetHashCode();
            var colors = new[]
            {
                "1abc9c", "2ecc71", "3498db", "9b59b6", 
                "e74c3c", "f39c12", "d35400", "c0392b"
            };
            var color = colors[Math.Abs(hash) % colors.Length];
            return $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(name)}&background={color}&color=fff&size=400";
        }

        public async Task<AgentDto?> GetAgentByIdAsync(int id)
        {
            var agent = await _context.Agents
                .Include(a => a.User)
                .Include(a => a.Reviews)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agent == null) return null;

            // Обновляем счетчик отзывов
            agent.ReviewsCount = agent.Reviews?.Count ?? 0;
            
            // Сохраняем изменения (если нужно обновить в базе)
            if (_context.Entry(agent).State == EntityState.Modified)
            {
                await _context.SaveChangesAsync();
            }

            return MapToDto(agent);
        }

        public async Task<bool> CreateAgentAsync(CreateAgentDto createDto)
        {
            try
            {
                // Проверяем, существует ли пользователь
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == createDto.Email);

                if (user == null)
                {
                    // Создаем нового пользователя
                    user = new User
                    {
                        Email = createDto.Email,
                        Fio = createDto.Fio,
                        Password = BCrypt.Net.BCrypt.HashPassword(createDto.Password),
                        Phone_num = createDto.Phone_num,
                        Id_agent = true
                    };
                    await _context.Users.AddAsync(user);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Обновляем флаг агента
                    user.Id_agent = true;
                    _context.Users.Update(user);
                }

                // Создаем агента
                var agent = new Agent
                {
                    UserId = user.Id,
                    Specialization = createDto.Specialization,
                    Experience = createDto.Experience,
                    Photo = createDto.Photo,
                    Rating = createDto.Rating
                };

                await _context.Agents.AddAsync(agent);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании агента");
                return false;
            }
        }

        public async Task<List<string>> GetCitiesAsync()
        {
            return new List<string>();
        }

        public async Task<List<string>> GetSpecialtiesAsync()
        {
            return await _context.Agents
                .Select(a => a.Specialization)
                .Distinct()
                .Where(s => !string.IsNullOrEmpty(s))
                .ToListAsync();
        }

        public async Task<List<AgentReviewDto>> GetAgentReviewsAsync(int agentId)
        {
            try
            {
                var reviews = await _context.AgentReviews
                    .Include(ar => ar.User)
                    .Where(ar => ar.AgentId == agentId)
                    .OrderByDescending(ar => ar.DataReviews)
                    .ToListAsync();

                return reviews.Select(ar => new AgentReviewDto
                {
                    Id = ar.Id,
                    UserId = ar.UserId,
                    UserName = ar.User.Fio,
                    AgentId = ar.AgentId,
                    Rating = ar.Rating,
                    Text = ar.Text,
                    DataReviews = ar.DataReviews,
                    FormattedDate = ar.DataReviews.ToString("dd.MM.yyyy")
                }).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отзывов агента с ID {AgentId}", agentId);
                throw;
            }
        }

        public async Task<bool> AddAgentReviewAsync(int agentId, int userId, CreateAgentReviewDto createDto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Проверяем, существует ли агент
                var agent = await _context.Agents.FindAsync(agentId);
                if (agent == null)
                    return false;

                // Создаем новый отзыв (без проверки на существующий)
                var review = new AgentReview
                {
                    UserId = userId,
                    AgentId = agentId,
                    Rating = createDto.Rating,
                    Text = createDto.Text,
                    DataReviews = DateTime.UtcNow.Date
                };
                
                await _context.AgentReviews.AddAsync(review);
                
                // Сохраняем изменения
                await _context.SaveChangesAsync();
                
                // Пересчитываем средний рейтинг агента и количество отзывов
                await UpdateAgentRatingAsync(agentId);
                
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Ошибка при добавлении отзыва агенту с ID {AgentId}", agentId);
                return false;
            }
        }

        private async Task UpdateAgentRatingAsync(int agentId)
        {
            var reviews = await _context.AgentReviews
                .Where(ar => ar.AgentId == agentId)
                .ToListAsync();
            
            if (reviews.Any())
            {
                var agent = await _context.Agents.FindAsync(agentId);
                if (agent != null)
                {
                    // Обновляем рейтинг
                    agent.Rating = Math.Round(reviews.Average(ar => ar.Rating), 1);
                    
                    // Обновляем количество отзывов
                    agent.ReviewsCount = reviews.Count;
                    
                    _context.Agents.Update(agent);
                    await _context.SaveChangesAsync();
                }
            }
        }

        public async Task<bool> UpdateAgentAsync(int id, UpdateAgentDto updateDto)
        {
            try
            {
                var agent = await _context.Agents
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (agent == null)
                    return false;

                // Обновляем данные агента
                if (!string.IsNullOrEmpty(updateDto.Specialization))
                    agent.Specialization = updateDto.Specialization;

                if (updateDto.Experience.HasValue)
                    agent.Experience = updateDto.Experience.Value;

                if (!string.IsNullOrEmpty(updateDto.Photo))
                    agent.Photo = updateDto.Photo;

                if (updateDto.Rating.HasValue)
                    agent.Rating = updateDto.Rating.Value;

                // Обновляем данные пользователя
                if (agent.User != null)
                {
                    if (!string.IsNullOrEmpty(updateDto.Fio))
                        agent.User.Fio = updateDto.Fio;

                    if (!string.IsNullOrEmpty(updateDto.Phone))
                        agent.User.Phone_num = updateDto.Phone;
                }

                _context.Agents.Update(agent);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении агента");
                return false;
            }
        }
    }
}