using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.Models;
using System.Security.Claims;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CateringRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CateringRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("incoming")]
        public async Task<IActionResult> GetIncomingRequests()
        {
            var ownerId = await GetCateringOwnerId();
            if (ownerId == null) return Unauthorized();

            var requests = await _context.HouseCateringRequests
                .Include(r => r.House)
                    .ThenInclude(h => h.HouseInfo)
                .Include(r => r.House)
                    .ThenInclude(h => h.Photos)   
                .Where(r => r.CateringOwnerId == ownerId && r.Status == "pending")
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.HouseId,
                    HouseAddress = r.House.HouseInfo != null
                        ? $"{r.House.HouseInfo.City}, {r.House.HouseInfo.Street}, {r.House.HouseInfo.HouseNumber}"
                        : "Адрес не указан",
                    r.CreatedAt,
                    HouseTitle = r.House.Description,
                    MainPhoto = r.House.Photos.FirstOrDefault() != null
                        ? r.House.Photos.FirstOrDefault().Photo
                        : null   
                })
                .ToListAsync();

            return Ok(new { success = true, data = requests });
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveRequest(int id)
        {
            var ownerId = await GetCateringOwnerId();
            if (ownerId == null) return Unauthorized();

            var request = await _context.HouseCateringRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.CateringOwnerId == ownerId && r.Status == "pending");
            if (request == null) return NotFound();

            request.Status = "approved";
            request.RespondedAt = DateTime.UtcNow;

            var houseCatering = new HouseCatering
            {
                HouseId = request.HouseId,
                CateringOwnerId = request.CateringOwnerId
            };
            _context.HouseCaterings.Add(houseCatering);

            var house = await _context.Houses.FindAsync(request.HouseId);
            if (house != null)
            {
                var notification = new Notification
                {
                    UserId = house.IdOwner,
                    Type = "cateringAddApproved",
                    ReferenceId = request.Id,
                    Text = $"Ваш запрос на добавление кейтеринга в объявление #{request.HouseId} одобрен.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectRequest(int id)
        {
            var ownerId = await GetCateringOwnerId();
            if (ownerId == null) return Unauthorized();

            var request = await _context.HouseCateringRequests
                .FirstOrDefaultAsync(r => r.Id == id && r.CateringOwnerId == ownerId && r.Status == "pending");
            if (request == null) return NotFound();

            request.Status = "rejected";
            request.RespondedAt = DateTime.UtcNow;

            var house = await _context.Houses.FindAsync(request.HouseId);
            if (house != null)
            {
                var notification = new Notification
                {
                    UserId = house.IdOwner,
                    Type = "cateringAddRejected",
                    ReferenceId = request.Id,
                    Text = $"Ваш запрос на добавление кейтеринга в объявление #{request.HouseId} отклонён.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        private async Task<int?> GetCateringOwnerId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId)) return null;
            var owner = await _context.CateringOwners.FirstOrDefaultAsync(c => c.UserId == userId);
            return owner?.Id;
        }
    }
}