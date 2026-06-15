using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs;
using System.Security.Claims;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public NotificationController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new NotificationDto
                {
                    Id = n.Id,
                    Type = n.Type,
                    ReferenceId = n.ReferenceId,
                    Text = n.Text,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead
                })
                .ToListAsync();

            var totalCount = await _context.Notifications.CountAsync(n => n.UserId == userId);

            return Ok(new { success = true, data = notifications, total = totalCount, page, pageSize });
        }
        [HttpPost("mark-all-read")]
public async Task<IActionResult> MarkAllAsRead()
{
    var userId = GetUserId();
    if (userId == null) return Unauthorized();

    var unreadNotifications = await _context.Notifications
        .Where(n => n.UserId == userId && !n.IsRead)
        .ToListAsync();

    foreach (var n in unreadNotifications)
        n.IsRead = true;

    await _context.SaveChangesAsync();
    return Ok(new { success = true, count = unreadNotifications.Count });
}
[HttpDelete("clear-all")]
public async Task<IActionResult> ClearAllNotifications()
{
    var userId = GetUserId();
    if (userId == null) return Unauthorized();

    var notifications = await _context.Notifications
        .Where(n => n.UserId == userId)
        .ToListAsync();

    _context.Notifications.RemoveRange(notifications);
    await _context.SaveChangesAsync();

    return Ok(new { success = true, message = "Все уведомления удалены" });
}

        [HttpPost("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();
            

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userId);
            if (notification == null)
                return NotFound();

            notification.IsRead = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
            
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            return null;
        }
    }
}