using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs.Admin;
using RentApp.API.Models;
using RentApp.API.Services;

namespace RentApp.API.Controllers.Admin
{
    [Route("api/admin/food")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminFoodController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;
        private readonly ILogger<AdminFoodController> _logger;

        public AdminFoodController(AppDbContext context, CloudinaryService cloudinaryService, ILogger<AdminFoodController> logger)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }

        // === RESTAURANTS ===
        [HttpGet("restaurants")]
        public async Task<IActionResult> GetRestaurants()
        {
            var restaurants = await _context.Restaurants
                .Include(r => r.MenuItems)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.LogoUrl,
                    MenuItemsCount = r.MenuItems.Count
                })
                .ToListAsync();
            return Ok(new { success = true, data = restaurants });
        }

        [HttpPost("restaurants")]
        public async Task<IActionResult> CreateRestaurant([FromForm] CreateRestaurantDto dto)
        {
            try
            {
                string? logoUrl = null;
                if (dto.LogoFile != null)
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(dto.LogoFile);
                    if (uploadResult != null) logoUrl = uploadResult.Secure_url;
                }

                var restaurant = new Restaurant
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    LogoUrl = logoUrl
                };
                _context.Restaurants.Add(restaurant);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = restaurant });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating restaurant");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("restaurants/{id}")]
        public async Task<IActionResult> UpdateRestaurant(int id, [FromForm] UpdateRestaurantDto dto)
        {
            var restaurant = await _context.Restaurants.FindAsync(id);
            if (restaurant == null)
                return NotFound(new { success = false, message = "Ресторан не найден" });

            restaurant.Name = dto.Name;
            restaurant.Description = dto.Description;

            if (dto.LogoFile != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(dto.LogoFile);
                if (uploadResult != null) restaurant.LogoUrl = uploadResult.Secure_url;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = restaurant });
        }

        [HttpDelete("restaurants/{id}")]
        public async Task<IActionResult> DeleteRestaurant(int id)
        {
            var restaurant = await _context.Restaurants
                .Include(r => r.MenuItems)
                .FirstOrDefaultAsync(r => r.Id == id);
            if (restaurant == null)
                return NotFound(new { success = false, message = "Ресторан не найден" });

            _context.Restaurants.Remove(restaurant);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // === MENU ITEMS ===
        [HttpGet("menu-items")]
        public async Task<IActionResult> GetMenuItems([FromQuery] int? restaurantId)
        {
            var query = _context.MenuItems.Include(m => m.Restaurant).AsQueryable();
            if (restaurantId.HasValue)
                query = query.Where(m => m.RestaurantId == restaurantId.Value);

            var items = await query.Select(m => new
            {
                m.Id,
                m.RestaurantId,
                RestaurantName = m.Restaurant.Name,
                m.Name,
                m.Description,
                m.Price,
                m.PhotoUrl,
                m.IsAvailable
            }).ToListAsync();
            return Ok(new { success = true, data = items });
        }

        [HttpPost("menu-items")]
        public async Task<IActionResult> CreateMenuItem([FromForm] CreateMenuItemDto dto)
        {
            try
            {
                string? photoUrl = null;
                if (dto.PhotoFile != null)
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(dto.PhotoFile);
                    if (uploadResult != null) photoUrl = uploadResult.Secure_url;
                }

                var menuItem = new MenuItem
                {
                    RestaurantId = dto.RestaurantId,
                    Name = dto.Name,
                    Description = dto.Description,
                    Price = dto.Price,
                    PhotoUrl = photoUrl,
                    IsAvailable = dto.IsAvailable
                };
                _context.MenuItems.Add(menuItem);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = menuItem });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating menu item");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("menu-items/{id}")]
        public async Task<IActionResult> UpdateMenuItem(int id, [FromForm] UpdateMenuItemDto dto)
        {
            var menuItem = await _context.MenuItems.FindAsync(id);
            if (menuItem == null)
                return NotFound(new { success = false, message = "Блюдо не найдено" });

            menuItem.Name = dto.Name;
            menuItem.Description = dto.Description;
            menuItem.Price = dto.Price;
            menuItem.IsAvailable = dto.IsAvailable;

            if (dto.PhotoFile != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(dto.PhotoFile);
                if (uploadResult != null) menuItem.PhotoUrl = uploadResult.Secure_url;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = menuItem });
        }

        [HttpDelete("menu-items/{id}")]
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null)
                return NotFound(new { success = false, message = "Блюдо не найдено" });

            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}