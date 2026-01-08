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
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FavoritesController> _logger;

        public FavoritesController(AppDbContext context, ILogger<FavoritesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/favorites/my
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyFavorites()
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

                var favorites = await _context.Favorites
                    .Where(f => f.UserId == userId)
                    .Include(f => f.House)
                        .ThenInclude(h => h.HouseInfo)
                    .Include(f => f.House)
                        .ThenInclude(h => h.Photos.Take(1))
                    .Include(f => f.House)
                        .ThenInclude(h => h.Owner)
                    .OrderByDescending(f => f.CreatedAt)
                    .Select(f => new
                    {
                        Id = f.House.Id,
                        Price = f.House.Price,
                        Area = f.House.Area,
                        Description = f.House.Description.Length > 100 
                            ? f.House.Description.Substring(0, 100) + "..." 
                            : f.House.Description,
                        FullDescription = f.House.Description,
                        HouseType = f.House.HouseType,
                        AnnouncementData = f.House.AnnouncementData.ToString("yyyy-MM-dd"),
                        Photos = f.House.Photos.Select(p => p.Photo).ToList(),
                        City = f.House.HouseInfo != null ? f.House.HouseInfo.City : string.Empty,
                        Street = f.House.HouseInfo != null ? f.House.HouseInfo.Street : string.Empty,
                        Rooms = f.House.HouseInfo != null ? f.House.HouseInfo.Rooms : 1,
                        Bathrooms = f.House.HouseInfo != null ? f.House.HouseInfo.Bathrooms : 1,
                        Floor = f.House.HouseInfo != null ? f.House.HouseInfo.Floor : 1,
                        Rating = f.House.Rating,
                        Year = DateTime.UtcNow.Year,
                        AddedToFavorites = f.CreatedAt.ToString("yyyy-MM-dd"),
                        IsActive = f.House.Active
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = favorites,
                    count = favorites.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении избранного");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // GET: api/favorites/count
        [HttpGet("count")]
        [Authorize]
        public async Task<IActionResult> GetFavoritesCount()
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

                var count = await _context.Favorites
                    .Where(f => f.UserId == userId)
                    .CountAsync();

                return Ok(new
                {
                    success = true,
                    count = count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении количества избранного");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // POST: api/favorites/add/{houseId}
        [HttpPost("add/{houseId}")]
        [Authorize]
        public async Task<IActionResult> AddToFavorites(int houseId)
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

                // Проверяем, существует ли дом
                var house = await _context.Houses.FindAsync(houseId);
                if (house == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Дом не найден"
                    });
                }

                // Проверяем, не добавлен ли уже дом в избранное
                var existingFavorite = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.HouseId == houseId);

                if (existingFavorite != null)
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Дом уже добавлен в избранное"
                    });
                }

                var favorite = new Favorite
                {
                    UserId = userId,
                    HouseId = houseId,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Favorites.AddAsync(favorite);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Дом добавлен в избранное: UserId={UserId}, HouseId={HouseId}", userId, houseId);

                return Ok(new
                {
                    success = true,
                    message = "Дом успешно добавлен в избранное",
                    favoriteId = favorite.Id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при добавлении в избранное");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // DELETE: api/favorites/remove/{houseId}
        [HttpDelete("remove/{houseId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFromFavorites(int houseId)
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

                var favorite = await _context.Favorites
                    .FirstOrDefaultAsync(f => f.UserId == userId && f.HouseId == houseId);

                if (favorite == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "Дом не найден в избранном"
                    });
                }

                _context.Favorites.Remove(favorite);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Дом удален из избранного: UserId={UserId}, HouseId={HouseId}", userId, houseId);

                return Ok(new
                {
                    success = true,
                    message = "Дом успешно удален из избранного"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении из избранного");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // GET: api/favorites/check/{houseId}
        [HttpGet("check/{houseId}")]
        [Authorize]
        public async Task<IActionResult> CheckIfFavorite(int houseId)
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

                var isFavorite = await _context.Favorites
                    .AnyAsync(f => f.UserId == userId && f.HouseId == houseId);

                return Ok(new
                {
                    success = true,
                    isFavorite = isFavorite
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при проверке избранного");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // DELETE: api/favorites/clear
        [HttpDelete("clear")]
        [Authorize]
        public async Task<IActionResult> ClearAllFavorites()
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

                var userFavorites = await _context.Favorites
                    .Where(f => f.UserId == userId)
                    .ToListAsync();

                if (!userFavorites.Any())
                {
                    return Ok(new
                    {
                        success = true,
                        message = "Избранное уже пустое"
                    });
                }

                _context.Favorites.RemoveRange(userFavorites);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Избранное очищено: UserId={UserId}, RemovedCount={Count}", userId, userFavorites.Count);

                return Ok(new
                {
                    success = true,
                    message = "Все дома удалены из избранного",
                    removedCount = userFavorites.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при очистке избранного");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }

        // ДОБАВЛЕНО: GET: api/favorites/my-favorites-ids
        [HttpGet("my-favorites-ids")]
        [Authorize]
        public async Task<IActionResult> GetMyFavoriteIds()
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

                var favoriteIds = await _context.Favorites
                    .Where(f => f.UserId == userId)
                    .Select(f => f.HouseId)
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    data = favoriteIds
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении ID избранных домов");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Внутренняя ошибка сервера"
                });
            }
        }
    }
}