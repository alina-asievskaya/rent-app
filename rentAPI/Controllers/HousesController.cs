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
    public class HousesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<HousesController> _logger;

        public HousesController(
            AppDbContext context, 
            ILogger<HousesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        private decimal CalculateHouseRating(int houseId)
        {
            var reviews = _context.ReviewHouses
                .Where(r => r.IdHouses == houseId)
                .ToList();
            
            if (reviews.Count == 0)
                return 0;
            
            return Math.Round((decimal)reviews.Average(r => r.Rating), 1);
        }

        private async Task UpdateHouseRating(int houseId)
        {
            var house = await _context.Houses.FindAsync(houseId);
            if (house != null)
            {
                house.Rating = CalculateHouseRating(houseId);
                await _context.SaveChangesAsync();
            }
        }

        // GET: api/houses
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllHouses()
        {
            try
            {
                var houses = await _context.Houses
                    .Where(h => h.Active)
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Photos.Take(1))
                    .Include(h => h.Owner)
                    .OrderByDescending(h => h.AnnouncementData)
                    .Select(h => new
                    {
                        h.Id,
                        h.Price,
                        h.Area,
                        h.Description,
                        h.AnnouncementData,
                        h.HouseType,
                        h.RentType, // <-- ДОБАВЛЕНО RentType
                        Photos = h.Photos.Select(p => p.Photo).ToList(),
                        HouseInfo = new
                        {
                            h.HouseInfo.Region,
                            h.HouseInfo.City,
                            h.HouseInfo.Street,
                            h.HouseInfo.Rooms,
                            h.HouseInfo.Bathrooms,
                            h.HouseInfo.Floor
                        },
                        Owner = new
                        {
                            h.Owner.Fio,
                            h.Owner.Phone_num
                        }
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = houses
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка домов");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // POST: api/houses/create
        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreateHouse([FromBody] CreateHouseDto houseDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Неверный токен"
                    });
                }

                var house = new House
                {
                    Price = houseDto.Price,
                    Area = houseDto.Area,
                    IdOwner = userId,
                    Description = houseDto.Description,
                    AnnouncementData = DateOnly.FromDateTime(DateTime.Now),
                    HouseType = houseDto.HouseType,
                    RentType = houseDto.RentType, // <-- ДОБАВЛЕНО RentType
                    Active = true
                };

                await _context.Houses.AddAsync(house);
                await _context.SaveChangesAsync();

                var houseInfo = new HouseInfo
                {
                    IdHouse = house.Id,
                    Region = houseDto.Region,
                    City = houseDto.City,
                    Street = houseDto.Street,
                    HouseNumber = houseDto.HouseNumber, 
                    Rooms = houseDto.Rooms,
                    Bathrooms = houseDto.Bathrooms,
                    Floor = houseDto.Floor
                };
                await _context.HousesInfo.AddAsync(houseInfo);

                var convenience = new Convenience
                {
                    IdHouse = house.Id,
                    Conditioner = houseDto.Conditioner,
                    Furniture = houseDto.Furniture,
                    Internet = houseDto.Internet,
                    Security = houseDto.Security,
                    VideoSurveillance = houseDto.VideoSurveillance,
                    FireAlarm = houseDto.FireAlarm,
                    Parking = houseDto.Parking,
                    Garage = houseDto.Garage,
                    Garden = houseDto.Garden,
                    SwimmingPool = houseDto.SwimmingPool,
                    Sauna = houseDto.Sauna,
                    Transport = houseDto.Transport ?? string.Empty,
                    Education = houseDto.Education ?? string.Empty,
                    Shops = houseDto.Shops ?? string.Empty
                };
                await _context.Conveniences.AddAsync(convenience);

                if (houseDto.PhotoUrls != null && houseDto.PhotoUrls.Any())
                {
                    foreach (var photoUrl in houseDto.PhotoUrls)
                    {
                        var photo = new PhotoHouse
                        {
                            IdHouse = house.Id,
                            Photo = photoUrl
                        };
                        await _context.PhotoHouses.AddAsync(photo);
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Новое объявление создано с Cloudinary: HouseID={HouseId}, UserID={UserId}", house.Id, userId);

                return Ok(new
                {
                    success = true,
                    message = "Объявление успешно создано",
                    houseId = house.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании объявления");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера при создании объявления"
                });
            }
        }

        [HttpGet("catalog")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCatalogHouses()
        {
            try
            {
                var houses = await _context.Houses
                    .Where(h => h.Active)
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Photos.Take(1))
                    .Include(h => h.Owner)
                    .Include(h => h.Convenience)
                    .OrderByDescending(h => h.AnnouncementData)
                    .ToListAsync();

                var formattedHouses = houses.Select(h => new
                {
                    Id = h.Id,
                    Price = h.Price,
                    Area = h.Area,
                    Description = h.Description.Length > 100 
                        ? h.Description.Substring(0, 100) + "..." 
                        : h.Description,
                    FullDescription = h.Description,
                    HouseType = h.HouseType,
                    RentType = h.RentType,
                    AnnouncementData = h.AnnouncementData.ToString("yyyy-MM-dd"),
                    Photos = h.Photos.Select(p => p.Photo).ToList(),
                    Region = h.HouseInfo?.Region ?? string.Empty,
                    City = h.HouseInfo?.City ?? string.Empty,
                    Street = h.HouseInfo?.Street ?? string.Empty,
                    HouseNumber = h.HouseInfo?.HouseNumber ?? string.Empty, // <-- ДОБАВЛЕНО
                    Rooms = h.HouseInfo?.Rooms ?? 1,
                    Bathrooms = h.HouseInfo?.Bathrooms ?? 1,
                    Floor = h.HouseInfo?.Floor ?? 1,
                    OwnerName = h.Owner?.Fio ?? h.Owner?.Email ?? "Неизвестно",
                    OwnerEmail = h.Owner?.Email ?? string.Empty,
                    IsPremium = h.Price > 500,
                    IsHot = h.AnnouncementData >= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7)),
                    Rating = h.Rating,
                    Year = DateTime.UtcNow.Year,
                    Features = GetFeaturesList(h.Convenience),
                    Badge = "Аренда",
                    ImageUrl = h.Photos.FirstOrDefault()?.Photo ?? "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
                    Beds = h.HouseInfo?.Rooms ?? 1,
                    Baths = h.HouseInfo?.Bathrooms ?? 1
                })
                .Select(h => new
                {
                    h.Id,
                    Price = h.Price.ToString("N0") + (h.RentType == "day" ? " Br/сутки" : " Br/мес"),
                    h.Area,
                    h.Description,
                    h.FullDescription,
                    h.HouseType,
                    h.RentType,
                    h.AnnouncementData,
                    h.Photos,
                    // Адрес теперь включает номер дома
                    Address = $"{h.City}, {h.Street}{(string.IsNullOrEmpty(h.HouseNumber) ? "" : $", {h.HouseNumber}")}",
                    ShortAddress = $"{h.City}, {h.Street.Substring(0, Math.Min(30, h.Street.Length))}...",
                    Info = $"{h.Rooms}-комн. {h.HouseType?.ToLower()}, {h.Area} м²",
                    h.Rooms,
                    h.Bathrooms,
                    h.Floor,
                    h.OwnerName,
                    h.OwnerEmail,
                    h.IsPremium,
                    h.IsHot,
                    h.Rating,
                    h.Year,
                    h.Features,
                    h.Badge,
                    h.ImageUrl,
                    h.Beds,
                    h.Baths,
                    // Можно также передать отдельные компоненты адреса для гибкости на фронте
                    h.City,
                    h.Street,
                    HouseNumber = h.HouseNumber
                })
                .ToList();

                _logger.LogInformation("Загружено {Count} объявлений для каталога", formattedHouses.Count);

                return Ok(new
                {
                    success = true,
                    data = formattedHouses,
                    total = formattedHouses.Count,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении каталога домов");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера при загрузке каталога",
                    error = ex.Message
                });
            }
        }
        // GET: api/houses/my-houses
        [HttpGet("my-houses")]
        [Authorize]
        public async Task<IActionResult> GetMyHouses()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Неверный токен"
                    });
                }

                var houses = await _context.Houses
                    .Where(h => h.IdOwner == userId)
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Photos.Take(1))
                    .OrderByDescending(h => h.AnnouncementData)
                    .ToListAsync();

                var formattedHouses = houses.Select(h => new
                {
                    h.Id,
                    h.Price,
                    h.Area,
                    h.Description,
                    h.Active,
                    h.HouseType,
                    h.RentType, 
                    AnnouncementData = h.AnnouncementData.ToString("yyyy-MM-dd"),
                    MainPhoto = h.Photos.FirstOrDefault()?.Photo ?? null,
                    HouseInfo = new
                    {
                        City = h.HouseInfo?.City ?? string.Empty,
                        Street = h.HouseInfo?.Street ?? string.Empty,
                        HouseNumber = h.HouseInfo?.HouseNumber ?? string.Empty,
                        Rooms = h.HouseInfo?.Rooms ?? 1
                    }
                }).ToList();

                return Ok(new
                {
                    success = true,
                    data = formattedHouses
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении моих объявлений");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // Добавить в HousesController следующие методы:

[HttpGet("{id}/caterings")]
public async Task<IActionResult> GetHouseCaterings(int id)
{
    var house = await _context.Houses.FindAsync(id);
    if (house == null) return NotFound();

    var caterings = await _context.HouseCaterings
        .Include(hc => hc.CateringOwner)
        .Where(hc => hc.HouseId == id)
        .Select(hc => new HouseCateringDto
        {
            Id = hc.Id,
            CateringOwnerId = hc.CateringOwnerId,
            CompanyName = hc.CateringOwner.CompanyName,
            City = hc.CateringOwner.City,
            Description = hc.CateringOwner.Description
        })
        .ToListAsync();
    return Ok(new { success = true, data = caterings });
}

// RentApp.API/Controllers/HousesController.cs – фрагмент

[HttpPut("{id}/caterings")]
public async Task<IActionResult> UpdateHouseCaterings(int id, [FromBody] UpdateHouseCateringsDto dto)
{
    var house = await _context.Houses.FindAsync(id);
    if (house == null) return NotFound();

    // Получаем текущие активные привязки (одобренные)
    var currentActive = await _context.HouseCaterings
        .Where(hc => hc.HouseId == id)
        .Select(hc => hc.CateringOwnerId)
        .ToListAsync();

    // Получаем текущие незавершённые заявки для этого дома
    var pendingRequests = await _context.HouseCateringRequests
        .Where(r => r.HouseId == id && r.Status == "pending")
        .ToListAsync();

    // Новые выбранные ID
    var newSelected = dto.CateringOwnerIds ?? new List<int>();

    // Заявки, которые нужно создать (есть в newSelected, нет в currentActive и нет уже в pending)
    var toCreate = newSelected.Except(currentActive)
        .Where(id => !pendingRequests.Any(r => r.CateringOwnerId == id))
        .ToList();

    // Удаляем активные привязки, которые были убраны из выбора
    var toRemove = currentActive.Except(newSelected).ToList();
    if (toRemove.Any())
    {
        var toRemoveEntities = await _context.HouseCaterings
            .Where(hc => hc.HouseId == id && toRemove.Contains(hc.CateringOwnerId))
            .ToListAsync();
        _context.HouseCaterings.RemoveRange(toRemoveEntities);
    }

    // Отклоняем заявки, которые были убраны из выбора (если ещё в статусе pending)
    var toCancelRequests = pendingRequests
        .Where(r => !newSelected.Contains(r.CateringOwnerId))
        .ToList();
    if (toCancelRequests.Any())
    {
        foreach (var req in toCancelRequests)
        {
            req.Status = "rejected";
            req.RespondedAt = DateTime.UtcNow;
        }
    }

    // Создаём новые заявки
    foreach (var ownerId in toCreate)
    {
        var request = new HouseCateringRequest
        {
            HouseId = id,
            CateringOwnerId = ownerId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };
        _context.HouseCateringRequests.Add(request);

        // Уведомление владельцу кейтеринга
        var cateringOwner = await _context.CateringOwners.FindAsync(ownerId);
        if (cateringOwner != null)
        {
            var notification = new Notification
            {
                UserId = cateringOwner.UserId,
                Type = "cateringAddRequest",
                ReferenceId = request.Id,
                Text = $"Вас добавили в объявление \"{house.Description}\" (дом #{id})",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);
        }
    }

    await _context.SaveChangesAsync();
    return Ok(new { success = true });
}

[HttpGet("available-caterings")]
public async Task<IActionResult> GetAvailableCaterings()
{
    var owners = await _context.CateringOwners
        .Where(co => co.IsActive)
        .Select(co => new { co.Id, co.CompanyName, co.City, co.Description, co.Phone })
        .ToListAsync();
    return Ok(new { success = true, data = owners });
}

        // PATCH: api/houses/{id}/toggle-active
        [HttpPatch("{id}/toggle-active")]
        [Authorize]
        public async Task<IActionResult> ToggleActive(int id, [FromBody] ToggleActiveDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Неверный токен"
                    });
                }

                var house = await _context.Houses
                    .FirstOrDefaultAsync(h => h.Id == id && h.IdOwner == userId);

                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Объявление не найдено или у вас нет прав"
                    });
                }

                house.Active = dto.Active;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Статус объявления изменен: HouseID={HouseId}, Active={Active}", id, dto.Active);

                return Ok(new
                {
                    success = true,
                    message = $"Объявление успешно {(dto.Active ? "активировано" : "деактивировано")}"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при изменении статуса объявления ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        [HttpGet("{id}/reviews")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHouseReviews(int id)
        {
            try
            {
                _logger.LogInformation("GET /api/houses/{Id}/reviews called", id);
                
                if (id <= 0)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Неверный ID дома"
                    });
                }
                
                var reviews = await _context.ReviewHouses
                    .Where(r => r.IdHouses == id)
                    .Include(r => r.User)
                    .OrderByDescending(r => r.DataReviews)
                    .Select(r => new
                    {
                        r.Id,
                        r.Rating,
                        r.Text,
                        DataReviews = r.DataReviews.ToString("yyyy-MM-dd"),
                        User = new
                        {
                            r.User.Fio,
                            r.User.Email
                        }
                    })
                    .ToListAsync();
                
                var house = await _context.Houses.FindAsync(id);
                var houseRating = house?.Rating ?? 0;
                
                return Ok(new 
                { 
                    success = true, 
                    data = reviews,
                    averageRating = houseRating,
                    totalReviews = reviews.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении отзывов для дома ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ошибка при получении отзывов"
                });
            }
        }

        [HttpGet("{houseId}/owner-info")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHouseOwnerInfo(int houseId)
        {
            try
            {
                var house = await _context.Houses
                    .Include(h => h.Owner)
                    .FirstOrDefaultAsync(h => h.Id == houseId);

                if (house == null)
                    return NotFound(new { success = false, message = "Дом не найден" });

                var ownerInfo = new
                {
                    id = house.IdOwner,
                    fio = house.Owner.Fio,
                    email = house.Owner.Email,
                    phone_num = house.Owner.Phone_num,
                    id_agent = house.Owner.Id_agent
                };

                return Ok(new { success = true, data = ownerInfo });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении информации о владельце дома {houseId}");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("users/by-email/{email}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var user = await _context.Users
                .Where(u => u.Email == email)
                .Select(u => new {
                    u.Fio,
                    u.Email,
                    u.Phone_num,
                })
                .FirstOrDefaultAsync();
            
            if (user == null)
                return NotFound();
            
            return Ok(new { success = true, data = user });
        }

        // PUT: api/houses/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateHouse(int id, [FromBody] UpdateHouseDto houseDto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Неверный токен"
                    });
                }

                var house = await _context.Houses
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Convenience)
                    .FirstOrDefaultAsync(h => h.Id == id && h.IdOwner == userId);

                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Объявление не найдено или у вас нет прав"
                    });
                }

                house.Price = houseDto.Price;
                house.Area = houseDto.Area;
                house.Description = houseDto.Description;
                house.HouseType = houseDto.HouseType;
                house.RentType = houseDto.RentType; // <-- ДОБАВЛЕНО RentType

                if (house.HouseInfo != null)
                {
                    house.HouseInfo.Region = houseDto.Region;
                    house.HouseInfo.City = houseDto.City;
                    house.HouseInfo.Street = houseDto.Street;
                     house.HouseInfo.HouseNumber = houseDto.HouseNumber; 
                    house.HouseInfo.Rooms = houseDto.Rooms;
                    house.HouseInfo.Bathrooms = houseDto.Bathrooms;
                    house.HouseInfo.Floor = houseDto.Floor;
                }

                if (house.Convenience != null)
                {
                    house.Convenience.Conditioner = houseDto.Conditioner;
                    house.Convenience.Furniture = houseDto.Furniture;
                    house.Convenience.Internet = houseDto.Internet;
                    house.Convenience.Security = houseDto.Security;
                    house.Convenience.VideoSurveillance = houseDto.VideoSurveillance;
                    house.Convenience.FireAlarm = houseDto.FireAlarm;
                    house.Convenience.Parking = houseDto.Parking;
                    house.Convenience.Garage = houseDto.Garage;
                    house.Convenience.Garden = houseDto.Garden;
                    house.Convenience.SwimmingPool = houseDto.SwimmingPool;
                    house.Convenience.Sauna = houseDto.Sauna;
                    house.Convenience.Transport = houseDto.Transport ?? string.Empty;
                    house.Convenience.Education = houseDto.Education ?? string.Empty;
                    house.Convenience.Shops = houseDto.Shops ?? string.Empty;
                }

                if (houseDto.PhotoUrls != null && houseDto.PhotoUrls.Any())
                {
                    if (houseDto.DeleteExistingPhotos)
                    {
                        var existingPhotos = await _context.PhotoHouses
                            .Where(p => p.IdHouse == house.Id)
                            .ToListAsync();
                        _context.PhotoHouses.RemoveRange(existingPhotos);
                    }

                    foreach (var photoUrl in houseDto.PhotoUrls)
                    {
                        var photo = new PhotoHouse
                        {
                            IdHouse = house.Id,
                            Photo = photoUrl
                        };
                        await _context.PhotoHouses.AddAsync(photo);
                    }
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Объявление обновлено: HouseID={HouseId}, UserID={UserId}", house.Id, userId);

                return Ok(new
                {
                    success = true,
                    message = "Объявление успешно обновлено",
                    houseId = house.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении объявления ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера при обновлении объявления"
                });
            }
        }

        [HttpPost("{id}/reviews")]
        [Authorize]
        public async Task<IActionResult> AddReview(int id, [FromBody] CreateReviewDto reviewDto)
        {
            try
            {
                _logger.LogInformation("POST /api/houses/{Id}/reviews called", id);
                
                if (reviewDto == null)
                {
                    _logger.LogWarning("ReviewDto is null");
                    return BadRequest(new
                    {
                        success = false,
                        message = "Данные отзыва не предоставлены"
                    });
                }

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    _logger.LogWarning("Model validation failed: Rating={Rating}, TextLength={TextLength}, Errors: {Errors}", 
                        reviewDto.Rating, reviewDto.Text?.Length, string.Join(", ", errors));
                    
                    return BadRequest(new
                    {
                        success = false,
                        message = "Некорректные данные отзыва",
                        errors = errors
                    });
                }
                
                if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
                {
                    _logger.LogWarning("Invalid rating: {Rating}", reviewDto.Rating);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Рейтинг должен быть от 1 до 5"
                    });
                }
                
                if (string.IsNullOrWhiteSpace(reviewDto.Text) || reviewDto.Text.Length < 10)
                {
                    _logger.LogWarning("Invalid text length: {Length}", reviewDto.Text?.Length);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Текст отзыва должен содержать минимум 10 символов"
                    });
                }
                
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    _logger.LogWarning("Invalid or missing user ID in token");
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Неверный токен"
                    });
                }
                
                var house = await _context.Houses.FindAsync(id);
                if (house == null)
                {
                    _logger.LogWarning("House with ID {Id} not found", id);
                    return NotFound(new
                    {
                        success = false,
                        message = "Дом не найден"
                    });
                }
                
                var existingReview = await _context.ReviewHouses
                    .FirstOrDefaultAsync(r => r.IdUser == userId && r.IdHouses == id);
                
                if (existingReview != null)
                {
                    _logger.LogWarning("User {UserId} already has review for house {HouseId}", userId, id);
                    return BadRequest(new
                    {
                        success = false,
                        message = "Вы уже оставляли отзыв на этот дом"
                    });
                }
                
                var review = new ReviewHouse
                {
                    IdUser = userId,
                    IdHouses = id,
                    Rating = reviewDto.Rating,
                    Text = reviewDto.Text.Trim(),
                    DataReviews = DateOnly.FromDateTime(DateTime.Now)
                };
                
                await _context.ReviewHouses.AddAsync(review);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Review added successfully for house {Id} by user {UserId}", id, userId);
                
                await UpdateHouseRating(id);
                
                house = await _context.Houses.FindAsync(id);
                var updatedRating = house?.Rating ?? 0;
                
                return Ok(new 
                { 
                    success = true, 
                    message = "Отзыв добавлен",
                    rating = updatedRating,
                    reviewId = review.Id
                });
            }
            catch (Exception ex)
            {   
                _logger.LogError(ex, "Ошибка при добавлении отзыва для дома ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ошибка при добавлении отзыва",
                    error = ex.Message
                });
            }
        }

        // DELETE: api/houses/{id}
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteHouse(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Неверный токен"
                    });
                }

                var house = await _context.Houses
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Photos)
                    .Include(h => h.Convenience)
                    .Include(h => h.Reviews)
                    .FirstOrDefaultAsync(h => h.Id == id && h.IdOwner == userId);

                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Объявление не найдено или у вас нет прав"
                    });
                }

                if (house.HouseInfo != null)
                    _context.HousesInfo.Remove(house.HouseInfo);
                
                if (house.Photos.Any())
                    _context.PhotoHouses.RemoveRange(house.Photos);
                
                if (house.Convenience != null)
                    _context.Conveniences.Remove(house.Convenience);
                
                if (house.Reviews.Any())
                    _context.ReviewHouses.RemoveRange(house.Reviews);

                _context.Houses.Remove(house);
                
                await _context.SaveChangesAsync();

                _logger.LogInformation("Объявление удалено: HouseID={HouseId}, UserID={UserId}", id, userId);

                return Ok(new
                {
                    success = true,
                    message = "Объявление успешно удалено"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении объявления ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера при удалении объявления"
                });
            }
        }

        // GET: api/houses/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetHouseById(int id)
        {
            try
            {
                var house = await _context.Houses
                    .Where(h => h.Id == id)
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Photos)
                    .Include(h => h.Owner)
                    .Include(h => h.Convenience)
                    .Include(h => h.Reviews)
                        .ThenInclude(r => r.User)
                    .FirstOrDefaultAsync();

                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Объявление не найдено"
                    });
                }

                var reviews = house.Reviews.Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Text,
                    DataReviews = r.DataReviews.ToString("yyyy-MM-dd"),
                    User = new
                    {
                        r.User.Fio,
                        r.User.Email
                    }
                }).ToList();

                var result = new
                {
                    Id = house.Id,
                    Price = house.Price,
                    Area = house.Area,
                    Description = house.Description,
                    HouseType = house.HouseType,
                    RentType = house.RentType, // <-- ДОБАВЛЕНО RentType
                    AnnouncementData = house.AnnouncementData.ToString("yyyy-MM-dd"),
                    Rating = house.Rating,
                    Reviews = reviews,
                    Active = house.Active,
                    Photos = house.Photos.Select(p => p.Photo).ToList(),
                    HouseInfo = house.HouseInfo != null ? new
                    {
                        house.HouseInfo.Region,
                        house.HouseInfo.City,
                        house.HouseInfo.Street,
                        house.HouseInfo.HouseNumber,
                        house.HouseInfo.Rooms,
                        house.HouseInfo.Bathrooms,
                        house.HouseInfo.Floor
                    } : null,
                    Owner = house.Owner != null ? new
                    {
                        house.Owner.Fio,
                        house.Owner.Email,
                        house.Owner.Phone_num
                    } : null,
                    Convenience = house.Convenience != null ? new
                    {
                        house.Convenience.Conditioner,
                        house.Convenience.Furniture,
                        house.Convenience.Internet,
                        house.Convenience.Security,
                        house.Convenience.VideoSurveillance,
                        house.Convenience.FireAlarm,
                        house.Convenience.Parking,
                        house.Convenience.Garage,
                        house.Convenience.Garden,
                        house.Convenience.SwimmingPool,
                        house.Convenience.Sauna,
                        house.Convenience.Transport,
                        house.Convenience.Education,
                        house.Convenience.Shops
                    } : null
                };

                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении объявления ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }
[HttpGet("geocode")]
[AllowAnonymous]
public async Task<IActionResult> Geocode([FromQuery] string address)
{
    if (string.IsNullOrWhiteSpace(address))
        return BadRequest(new { success = false, message = "Адрес не указан" });

    var apiKey = "99ce5728-f41e-40c2-a29c-ac52aeaffa5c"; // ваш ключ геокодера
    var encodedAddress = Uri.EscapeDataString(address + ", Беларусь");
    var url = $"https://geocode-maps.yandex.ru/1.x/?apikey={apiKey}&geocode={encodedAddress}&format=json&results=1";

    using var http = new HttpClient();
    var response = await http.GetAsync(url);
    var content = await response.Content.ReadAsStringAsync();

    return Content(content, "application/json");
}
        // АДМИН-МЕТОДЫ

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id}")]
        public async Task<IActionResult> UpdateHouseAdmin(int id, [FromBody] UpdateHouseDto houseDto)
        {
            try
            {
                var house = await _context.Houses
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Convenience)
                    .FirstOrDefaultAsync(h => h.Id == id);

                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Объявление не найдено"
                    });
                }

                house.Price = houseDto.Price;
                house.Area = houseDto.Area;
                house.Description = houseDto.Description;
                house.HouseType = houseDto.HouseType;
                house.RentType = houseDto.RentType; // <-- ДОБАВЛЕНО RentType

                if (house.HouseInfo != null)
                {
                    house.HouseInfo.Region = houseDto.Region;
                    house.HouseInfo.City = houseDto.City;
                    house.HouseInfo.Street = houseDto.Street;
                    house.HouseInfo.Rooms = houseDto.Rooms;
                    house.HouseInfo.Bathrooms = houseDto.Bathrooms;
                    house.HouseInfo.Floor = houseDto.Floor;
                }

                if (house.Convenience != null)
                {
                    house.Convenience.Conditioner = houseDto.Conditioner;
                    house.Convenience.Furniture = houseDto.Furniture;
                    house.Convenience.Internet = houseDto.Internet;
                    house.Convenience.Security = houseDto.Security;
                    house.Convenience.VideoSurveillance = houseDto.VideoSurveillance;
                    house.Convenience.FireAlarm = houseDto.FireAlarm;
                    house.Convenience.Parking = houseDto.Parking;
                    house.Convenience.Garage = houseDto.Garage;
                    house.Convenience.Garden = houseDto.Garden;
                    house.Convenience.SwimmingPool = houseDto.SwimmingPool;
                    house.Convenience.Sauna = houseDto.Sauna;
                    house.Convenience.Transport = houseDto.Transport ?? string.Empty;
                    house.Convenience.Education = houseDto.Education ?? string.Empty;
                    house.Convenience.Shops = houseDto.Shops ?? string.Empty;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Админ обновил объявление: HouseID={HouseId}", house.Id);

                return Ok(new
                {
                    success = true,
                    message = "Объявление успешно обновлено администратором",
                    houseId = house.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении объявления админом ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера при обновлении объявления"
                });
            }
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPatch("admin/{id}/toggle-active")]
        public async Task<IActionResult> ToggleActiveAdmin(int id, [FromBody] ToggleActiveDto dto)
        {
            try
            {
                var house = await _context.Houses
                    .FirstOrDefaultAsync(h => h.Id == id);

                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Объявление не найдено"
                    });
                }

                house.Active = dto.Active;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Админ изменил статус объявления: HouseID={HouseId}, Active={Active}", id, dto.Active);

                return Ok(new
                {
                    success = true,
                    message = $"Статус объявления успешно {(dto.Active ? "активирован" : "деактивирован")} администратором"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при изменении статуса объявления админом ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("admin/{id}")]
        public async Task<IActionResult> DeleteHouseAdmin(int id)
        {
            try
            {
                var house = await _context.Houses
                    .Include(h => h.HouseInfo)
                    .Include(h => h.Photos)
                    .Include(h => h.Convenience)
                    .Include(h => h.Reviews)
                    .FirstOrDefaultAsync(h => h.Id == id);

                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Объявление не найдено"
                    });
                }

                if (house.HouseInfo != null)
                    _context.HousesInfo.Remove(house.HouseInfo);
                
                if (house.Photos.Any())
                    _context.PhotoHouses.RemoveRange(house.Photos);
                
                if (house.Convenience != null)
                    _context.Conveniences.Remove(house.Convenience);
                
                if (house.Reviews.Any())
                    _context.ReviewHouses.RemoveRange(house.Reviews);

                _context.Houses.Remove(house);
                
                await _context.SaveChangesAsync();

                _logger.LogInformation("Админ удалил объявление: HouseID={HouseId}", id);

                return Ok(new
                {
                    success = true,
                    message = "Объявление успешно удалено администратором"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении объявления админом ID={Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера при удалении объявления"
                });
            }
        }

        private List<string> GetFeaturesList(Convenience? convenience)
        {
            if (convenience == null)
                return new List<string>();

            var features = new List<string>();
            
            if (convenience.Conditioner)
                features.Add("Кондиционер");
            if (convenience.Furniture)
                features.Add("Мебель");
            if (convenience.Internet)
                features.Add("Интернет");
            if (convenience.Security)
                features.Add("Охрана");
            if (convenience.Parking)
                features.Add("Парковка");
            if (convenience.Garage)
                features.Add("Гараж");
            if (convenience.Garden)
                features.Add("Сад");
            if (convenience.SwimmingPool)
                features.Add("Бассейн");
            if (convenience.Sauna)
                features.Add("Сауна");

            return features;
        }

        private async Task<bool> UserIsOwnerOrAdmin(int houseId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return false;
            }

            var isOwner = await _context.Houses
                .AnyAsync(h => h.Id == houseId && h.IdOwner == userId);

            var user = await _context.Users.FindAsync(userId);
            var isAdmin = user?.Id_agent == true;

            return isOwner || isAdmin;
        }
    }
}