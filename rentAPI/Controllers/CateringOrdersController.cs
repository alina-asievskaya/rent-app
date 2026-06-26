using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.Models;
using System.Security.Claims;
using System.Text.Json;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CateringOrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<CateringOrdersController> _logger;

        public CateringOrdersController(AppDbContext context, ILogger<CateringOrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateCateringOrderDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var booking = await _context.Bookings.FindAsync(dto.BookingId);
            if (booking == null || booking.UserId != userId)
                return BadRequest(new { success = false, message = "Бронирование не найдено" });

            var itemsJson = JsonSerializer.Serialize(dto.Items);
            var order = new CateringOrder
            {
                BookingId = dto.BookingId,
                CateringOwnerId = dto.CateringOwnerId,
                HouseId = booking.HouseId,
                UserId = userId.Value,      
                ItemsJson = itemsJson,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.CateringOrders.Add(order);
            await _context.SaveChangesAsync();

            var notification = new Notification
            {
                UserId = order.CateringOwnerId,
                Type = "cateringOrder",
                ReferenceId = order.Id,
                Text = $"Новая заявка на кейтеринг для дома ID {order.HouseId}",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, orderId = order.Id });
        }

        [HttpGet("incoming")]
        public async Task<IActionResult> GetIncomingOrders()
        {
            var ownerId = GetCateringOwnerId();
            if (ownerId == null) return Unauthorized();

            var orders = await _context.CateringOrders
                .Include(o => o.Booking).ThenInclude(b => b.User)
                .Include(o => o.House).ThenInclude(h => h.HouseInfo)
                .Where(o => o.CateringOwnerId == ownerId && o.Status == "pending")
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new CateringOrderResponseDto
                {
                    Id = o.Id,
                    BookingId = o.BookingId,
                    CateringOwnerId = o.CateringOwnerId,
                    CateringCompanyName = o.CateringOwner != null ? o.CateringOwner.CompanyName : "",
                    HouseId = o.HouseId,
                    HouseAddress = o.House.HouseInfo != null ? $"{o.House.HouseInfo.City}, {o.House.HouseInfo.Street}" : "",
                    UserId = o.UserId,
                    UserName = o.Booking.User.Fio,
                    UserPhone = o.Booking.User.Phone_num,
                    ItemsJson = o.ItemsJson,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    RespondedAt = o.RespondedAt
                })
                .ToListAsync();

            foreach (var order in orders)
            {
                try
                {
                    order.Items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(order.ItemsJson) ?? new();
                }
                catch { order.Items = new(); }
            }

            return Ok(new { success = true, data = orders });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateCateringOrderStatusDto dto)
        {
            var ownerId = GetCateringOwnerId();
            if (ownerId == null) return Unauthorized();

            var order = await _context.CateringOrders
                .FirstOrDefaultAsync(o => o.Id == id && o.CateringOwnerId == ownerId);
            if (order == null) return NotFound();

            if (dto.Status != "approved" && dto.Status != "rejected")
                return BadRequest(new { success = false, message = "Неверный статус" });

            order.Status = dto.Status;
            order.RespondedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var notification = new Notification
            {
                UserId = order.UserId,
                Type = "cateringOrderStatus",
                ReferenceId = order.Id,
                Text = dto.Status == "approved"
                    ? $"Заказ кейтеринга для дома ID {order.HouseId} одобрен!"
                    : $"Заказ кейтеринга для дома ID {order.HouseId} отклонён.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllOrders()
        {
            var ownerId = GetCateringOwnerId();
            if (ownerId == null) return Unauthorized();

            var orders = await _context.CateringOrders
                .Include(o => o.Booking).ThenInclude(b => b.User)
                .Include(o => o.House).ThenInclude(h => h.HouseInfo)
                .Where(o => o.CateringOwnerId == ownerId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new CateringOrderResponseDto
                {
                    Id = o.Id,
                    BookingId = o.BookingId,
                    CateringOwnerId = o.CateringOwnerId,
                    CateringCompanyName = o.CateringOwner != null ? o.CateringOwner.CompanyName : "",
                    HouseId = o.HouseId,
                    HouseAddress = o.House.HouseInfo != null ? $"{o.House.HouseInfo.City}, {o.House.HouseInfo.Street}" : "",
                    UserId = o.UserId,
                    UserName = o.Booking.User.Fio,
                    UserPhone = o.Booking.User.Phone_num,
                    ItemsJson = o.ItemsJson,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    RespondedAt = o.RespondedAt,
                    BookingDate = o.Booking.BookingDate.ToString("yyyy-MM-dd")
                })
                .ToListAsync();

            foreach (var order in orders)
            {
                try
                {
                    order.Items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(order.ItemsJson) ?? new();
                }
                catch { order.Items = new(); }
            }

            return Ok(new { success = true, data = orders });
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetOrderByBooking(int bookingId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var order = await _context.CateringOrders
                .Include(o => o.CateringOwner)
                .FirstOrDefaultAsync(o => o.BookingId == bookingId && (o.UserId == userId || o.CateringOwnerId == GetCateringOwnerId()));
            if (order == null) return Ok(new { success = true, data = (object?)null });

            var response = new CateringOrderResponseDto
            {
                Id = order.Id,
                BookingId = order.BookingId,
                CateringOwnerId = order.CateringOwnerId,
                CateringCompanyName = order.CateringOwner?.CompanyName ?? "",
                ItemsJson = order.ItemsJson,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                RespondedAt = order.RespondedAt
            };
            try
            {
                response.Items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(order.ItemsJson) ?? new();
            }
            catch { response.Items = new(); }

            return Ok(new { success = true, data = response });
        }

        private int? GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(claim, out int id) ? id : null;
        }

        private int? GetCateringOwnerId()
        {
            var userId = GetUserId();
            if (userId == null) return null;
            var owner = _context.CateringOwners.FirstOrDefault(co => co.UserId == userId);
            return owner?.Id;
        }
    }
}