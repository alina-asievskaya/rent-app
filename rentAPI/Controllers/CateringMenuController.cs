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
    public class CateringMenuController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CateringMenuController(AppDbContext context)
        {
            _context = context;
        }

        private async Task<int?> GetCateringOwnerId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return null;
            var owner = await _context.CateringOwners.FirstOrDefaultAsync(c => c.UserId == userId);
            return owner?.Id;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyMenu()
        {
            var ownerId = await GetCateringOwnerId();
            if (ownerId == null)
                return Unauthorized(new { success = false, message = "Вы не являетесь владельцем кейтеринга" });

            var items = await _context.MenuItems
                .Where(m => m.CateringOwnerId == ownerId)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new MenuItemDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    Price = m.Price,
                    WeightGrams = m.WeightGrams,
                    PhotoUrl = m.PhotoUrl,
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, data = items });
        }

        [HttpPost]
        public async Task<IActionResult> AddMenuItem([FromBody] CreateMenuItemDto dto)
        {
            var ownerId = await GetCateringOwnerId();
            if (ownerId == null)
                return Unauthorized(new { success = false, message = "Вы не являетесь владельцем кейтеринга" });

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { success = false, message = "Название блюда обязательно" });

            var item = new MenuItem
            {
                CateringOwnerId = ownerId.Value,
                Name = dto.Name,
                Description = dto.Description ?? "",
                Price = dto.Price,
                WeightGrams = dto.WeightGrams,
                PhotoUrl = dto.PhotoUrl ?? "",
                CreatedAt = DateTime.UtcNow
            };

            _context.MenuItems.Add(item);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Блюдо добавлено", id = item.Id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMenuItem(int id, [FromBody] UpdateMenuItemDto dto)
        {
            var ownerId = await GetCateringOwnerId();
            if (ownerId == null)
                return Unauthorized(new { success = false, message = "Вы не являетесь владельцем кейтеринга" });

            var item = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id && m.CateringOwnerId == ownerId);
            if (item == null)
                return NotFound(new { success = false, message = "Блюдо не найдено" });

            if (!string.IsNullOrWhiteSpace(dto.Name))
                item.Name = dto.Name;
            item.Description = dto.Description ?? "";
            item.Price = dto.Price;
            item.WeightGrams = dto.WeightGrams;
            item.PhotoUrl = dto.PhotoUrl ?? "";

            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Блюдо обновлено" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMenuItem(int id)
        {
            var ownerId = await GetCateringOwnerId();
            if (ownerId == null)
                return Unauthorized(new { success = false, message = "Вы не являетесь владельцем кейтеринга" });

            var item = await _context.MenuItems.FirstOrDefaultAsync(m => m.Id == id && m.CateringOwnerId == ownerId);
            if (item == null)
                return NotFound(new { success = false, message = "Блюдо не найдено" });

            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Блюдо удалено" });
        }
    }
}