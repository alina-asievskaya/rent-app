using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs;
using RentApp.API.DTOs.Bookings;
using RentApp.API.Models;
using System.Security.Claims;
using System.Text.Json;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<BookingsController> _logger;

        public BookingsController(AppDbContext context, ILogger<BookingsController> logger)
        {
            _context = context;
            _logger = logger;
        }

       [HttpPost]
public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
{
    try
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            return Unauthorized(new { success = false, message = "Неверный токен" });

        var house = await _context.Houses.FindAsync(dto.HouseId);
        if (house == null)
            return NotFound(new { success = false, message = "Дом не найден" });

        // ============ НОВЫЕ ПРОВЕРКИ ============
        // 1. Запрет бронирования для владельца
        if (house.IdOwner == userId)
            return BadRequest(new { success = false, message = "Вы не можете забронировать собственный дом" });

        var bookingDate = DateOnly.FromDateTime(dto.BookingDate);

        // 2. Для посуточной аренды – не более 30 дней вперёд
        // Предполагается, что в модели House есть поле RentType (string) со значениями "day" или "month"
        if (house.RentType == "day")
        {
            var maxDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30));
            if (bookingDate > maxDate)
                return BadRequest(new { success = false, message = "Для посуточной аренды нельзя бронировать более чем на 30 дней вперед" });
        }
        // =======================================

        var booking = new Booking
        {
            HouseId = dto.HouseId,
            UserId = userId,
            BookingDate = bookingDate,
            Approved = false,
            RejectedAt = null,
            CreatedAt = DateTime.UtcNow,
            CateringOwnerId = dto.CateringOwnerId,
            CateringItemsJson = dto.CateringItems != null && dto.CateringItems.Any()
                ? JsonSerializer.Serialize(dto.CateringItems)
                : null
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        var ownerNotification = new Notification
        {
            UserId = house.IdOwner,
            Type = "booking",
            ReferenceId = booking.Id,
            Text = $"Новая заявка на бронирование дома #{house.Id} на {bookingDate:yyyy-MM-dd}",
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };
        _context.Notifications.Add(ownerNotification);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Создано бронирование (ожидает): {BookingId} для дома {HouseId} пользователем {UserId}",
            booking.Id, dto.HouseId, userId);

        return Ok(new { success = true, message = "Заявка на бронирование отправлена владельцу", bookingId = booking.Id });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Ошибка при создании бронирования");
        return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
    }
}

        [HttpGet("check-availability")]
        [AllowAnonymous]
        public async Task<IActionResult> CheckAvailability([FromQuery] int houseId, [FromQuery] DateTime date)
        {
            try
            {
                var bookingDate = DateOnly.FromDateTime(date);
                var isAvailable = !await _context.Bookings
                    .AnyAsync(b => b.HouseId == houseId && b.BookingDate == bookingDate && b.Approved);
                return Ok(new { isAvailable });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка проверки доступности");
                return StatusCode(500, new { success = false, message = "Ошибка сервера" });
            }
        }

        [HttpGet("house/{houseId}/booked-dates")]
        [AllowAnonymous]
        public async Task<IActionResult> GetBookedDates(int houseId)
        {
            try
            {
                var bookedDates = await _context.Bookings
                    .Where(b => b.HouseId == houseId && b.Approved)
                    .Select(b => b.BookingDate)
                    .ToListAsync();
                return Ok(new { bookedDates = bookedDates.Select(d => d.ToString("yyyy-MM-dd")) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка получения занятых дат");
                return StatusCode(500, new { success = false, message = "Ошибка сервера" });
            }
        }

        [HttpGet("incoming-requests")]
        public async Task<IActionResult> GetIncomingRequests()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var myHouseIds = await _context.Houses
                .Where(h => h.IdOwner == userId)
                .Select(h => h.Id)
                .ToListAsync();

            var requests = await _context.Bookings
                .Include(b => b.House).ThenInclude(h => h.Photos)
                .Include(b => b.User)
                .Where(b => myHouseIds.Contains(b.HouseId) && !b.Approved && b.RejectedAt == null)
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new
                {
                    b.Id,
                    b.HouseId,
                    HouseAddress = b.House.HouseInfo != null
                        ? $"{b.House.HouseInfo.City}, {b.House.HouseInfo.Street}"
                        : "Адрес не указан",
                    MainPhoto = b.House.Photos.FirstOrDefault().Photo,
                    b.BookingDate,
                    b.CreatedAt,
                    UserName = b.User.Fio,
                    UserId = b.User.Id
                })
                .ToListAsync();

            return Ok(new { success = true, data = requests });
        }

        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            var userId = GetCurrentUserId();
            var booking = await _context.Bookings
                .Include(b => b.House)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();
            if (booking.House.IdOwner != userId) return Forbid();

            if (booking.Approved || booking.RejectedAt != null)
                return BadRequest(new { success = false, message = "Бронирование уже обработано" });

            booking.Approved = true;
            booking.RejectedAt = null;
            await _context.SaveChangesAsync();

            var otherRequests = await _context.Bookings
                .Where(b => b.HouseId == booking.HouseId
                         && b.BookingDate == booking.BookingDate
                         && b.Id != booking.Id
                         && !b.Approved
                         && b.RejectedAt == null)
                .ToListAsync();

            foreach (var other in otherRequests)
            {
                other.RejectedAt = DateTime.UtcNow;
                var rejectNotification = new Notification
                {
                    UserId = other.UserId,
                    Type = "bookingStatus",
                    ReferenceId = other.Id,
                    Text = $"Ваша заявка на {other.BookingDate:yyyy-MM-dd} для дома #{other.HouseId} отклонена – дата занята другим бронированием.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };
                _context.Notifications.Add(rejectNotification);
            }
            await _context.SaveChangesAsync();

            if (booking.CateringOwnerId.HasValue && !string.IsNullOrEmpty(booking.CateringItemsJson))
            {
                var items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(booking.CateringItemsJson);
                if (items != null && items.Any())
                {
                    var order = new CateringOrder
                    {
                        BookingId = booking.Id,
                        CateringOwnerId = booking.CateringOwnerId.Value,
                        HouseId = booking.HouseId,
                        UserId = booking.UserId,
                        ItemsJson = booking.CateringItemsJson,
                        Status = "pending",
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.CateringOrders.Add(order);
                    await _context.SaveChangesAsync();

                    var cateringOwner = await _context.CateringOwners
                        .Include(co => co.User)
                        .FirstOrDefaultAsync(co => co.Id == booking.CateringOwnerId);
                    if (cateringOwner?.UserId != null)
                    {
                        var cateringNotification = new Notification
                        {
                            UserId = cateringOwner.UserId,
                            Type = "cateringOrder",
                            ReferenceId = order.Id,
                            Text = $"Новый заказ на кейтеринг для дома #{booking.HouseId}",
                            CreatedAt = DateTime.UtcNow,
                            IsRead = false
                        };
                        _context.Notifications.Add(cateringNotification);
                        await _context.SaveChangesAsync();
                    }
                }
            }

            var userNotification = new Notification
            {
                UserId = booking.UserId,
                Type = "bookingStatus",
                ReferenceId = booking.Id,
                Text = $"Ваше бронирование дома #{booking.HouseId} на {booking.BookingDate:yyyy-MM-dd} одобрено!",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(userNotification);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectBooking(int id)
        {
            var userId = GetCurrentUserId();
            var booking = await _context.Bookings
                .Include(b => b.House)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();
            if (booking.House.IdOwner != userId) return Forbid();

            booking.Approved = false;
            booking.RejectedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var userNotification = new Notification
            {
                UserId = booking.UserId,
                Type = "bookingStatus",
                ReferenceId = booking.Id,
                Text = $"К сожалению, бронирование дома #{booking.HouseId} на {booking.BookingDate:yyyy-MM-dd} отклонено.",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };
            _context.Notifications.Add(userNotification);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpGet("user-bookings")]
        public async Task<IActionResult> GetUserBookings()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var bookings = await _context.Bookings
                .Include(b => b.House)
                    .ThenInclude(h => h.HouseInfo)
                .Include(b => b.House).ThenInclude(h => h.Photos)
                .Include(b => b.House).ThenInclude(h => h.Owner)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            var result = new List<BookingWithCateringDto>();
            foreach (var b in bookings)
            {
                CateringOrderInfoDto? cateringInfo = null;
                OwnerInfoDto? cateringOwnerInfo = null;

                var cateringOrder = await _context.CateringOrders
                    .FirstOrDefaultAsync(co => co.BookingId == b.Id);
                
                if (cateringOrder != null)
                {
                    var items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(cateringOrder.ItemsJson) ?? new();
                    cateringInfo = new CateringOrderInfoDto
                    {
                        Id = cateringOrder.Id,
                        Status = cateringOrder.Status,
                        Items = items,
                        TotalPrice = items.Sum(i => i.Price * i.Quantity)
                    };
                    var cateringOwner = await _context.CateringOwners
                        .Include(co => co.User)
                        .FirstOrDefaultAsync(co => co.Id == cateringOrder.CateringOwnerId);
                    if (cateringOwner?.User != null)
                    {
                        cateringOwnerInfo = new OwnerInfoDto
                        {
                            UserId = cateringOwner.User.Id,
                            Name = cateringOwner.User.Fio,
                            Phone = cateringOwner.User.Phone_num,
                            Email = cateringOwner.User.Email
                        };
                    }
                }
                else if (b.CateringOwnerId.HasValue && !string.IsNullOrEmpty(b.CateringItemsJson))
                {
                    var items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(b.CateringItemsJson) ?? new();
                    cateringInfo = new CateringOrderInfoDto
                    {
                        Id = 0,
                        Status = b.Approved ? "pending" : "waiting_owner",
                        Items = items,
                        TotalPrice = items.Sum(i => i.Price * i.Quantity)
                    };
                    if (b.CateringOwnerId.HasValue)
                    {
                        var cateringOwner = await _context.CateringOwners
                            .Include(co => co.User)
                            .FirstOrDefaultAsync(co => co.Id == b.CateringOwnerId);
                        if (cateringOwner?.User != null)
                        {
                            cateringOwnerInfo = new OwnerInfoDto
                            {
                                UserId = cateringOwner.User.Id,
                                Name = cateringOwner.User.Fio,
                                Phone = cateringOwner.User.Phone_num,
                                Email = cateringOwner.User.Email
                            };
                        }
                    }
                }

                var houseOwner = b.House.Owner;
                var ownerInfo = new OwnerInfoDto
                {
                    UserId = houseOwner.Id,
                    Name = houseOwner.Fio,
                    Phone = houseOwner.Phone_num,
                    Email = houseOwner.Email
                };

                result.Add(new BookingWithCateringDto
                {
                    Id = b.Id,
                    HouseId = b.HouseId,
                    HouseAddress = b.House.HouseInfo != null
                        ? $"{b.House.HouseInfo.City}, {b.House.HouseInfo.Street}"
                        : "Адрес не указан",
                    MainPhoto = b.House.Photos.FirstOrDefault()?.Photo,
                    BookingDate = b.BookingDate,
                    Approved = b.Approved,
                    RejectedAt = b.RejectedAt,
                    CreatedAt = b.CreatedAt,
                    Catering = cateringInfo,
                    HouseOwner = ownerInfo,
                    CateringOwnerInfo = cateringOwnerInfo
                });
            }

            return Ok(new { success = true, data = result });
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetBookingHistory()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var bookings = await _context.Bookings
                .Include(b => b.House)
                    .ThenInclude(h => h.HouseInfo)
                .Include(b => b.House).ThenInclude(h => h.Photos)
                .Include(b => b.House).ThenInclude(h => h.Owner)
                .Where(b => b.UserId == userId &&
                            (b.BookingDate < today || (b.RejectedAt != null && b.BookingDate >= today)))
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            var result = new List<BookingWithCateringDto>();
            foreach (var b in bookings)
            {
                CateringOrderInfoDto? cateringInfo = null;
                OwnerInfoDto? cateringOwnerInfo = null;

                var cateringOrder = await _context.CateringOrders
                    .FirstOrDefaultAsync(co => co.BookingId == b.Id);
                
                if (cateringOrder != null)
                {
                    var items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(cateringOrder.ItemsJson) ?? new();
                    cateringInfo = new CateringOrderInfoDto
                    {
                        Id = cateringOrder.Id,
                        Status = cateringOrder.Status,
                        Items = items,
                        TotalPrice = items.Sum(i => i.Price * i.Quantity)
                    };
                    var cateringOwner = await _context.CateringOwners
                        .Include(co => co.User)
                        .FirstOrDefaultAsync(co => co.Id == cateringOrder.CateringOwnerId);
                    if (cateringOwner?.User != null)
                    {
                        cateringOwnerInfo = new OwnerInfoDto
                        {
                            UserId = cateringOwner.User.Id,
                            Name = cateringOwner.User.Fio,
                            Phone = cateringOwner.User.Phone_num,
                            Email = cateringOwner.User.Email
                        };
                    }
                }
                else if (b.CateringOwnerId.HasValue && !string.IsNullOrEmpty(b.CateringItemsJson))
                {
                    var items = JsonSerializer.Deserialize<List<CateringOrderItemDto>>(b.CateringItemsJson) ?? new();
                    cateringInfo = new CateringOrderInfoDto
                    {
                        Id = 0,
                        Status = b.Approved ? "pending" : "waiting_owner",
                        Items = items,
                        TotalPrice = items.Sum(i => i.Price * i.Quantity)
                    };
                    if (b.CateringOwnerId.HasValue)
                    {
                        var cateringOwner = await _context.CateringOwners
                            .Include(co => co.User)
                            .FirstOrDefaultAsync(co => co.Id == b.CateringOwnerId);
                        if (cateringOwner?.User != null)
                        {
                            cateringOwnerInfo = new OwnerInfoDto
                            {
                                UserId = cateringOwner.User.Id,
                                Name = cateringOwner.User.Fio,
                                Phone = cateringOwner.User.Phone_num,
                                Email = cateringOwner.User.Email
                            };
                        }
                    }
                }

                var houseOwner = b.House.Owner;
                var ownerInfo = new OwnerInfoDto
                {
                    UserId = houseOwner.Id,
                    Name = houseOwner.Fio,
                    Phone = houseOwner.Phone_num,
                    Email = houseOwner.Email
                };

                result.Add(new BookingWithCateringDto
                {
                    Id = b.Id,
                    HouseId = b.HouseId,
                    HouseAddress = b.House.HouseInfo != null
                        ? $"{b.House.HouseInfo.City}, {b.House.HouseInfo.Street}"
                        : "Адрес не указан",
                    MainPhoto = b.House.Photos.FirstOrDefault()?.Photo,
                    BookingDate = b.BookingDate,
                    Approved = b.Approved,
                    RejectedAt = b.RejectedAt,
                    CreatedAt = b.CreatedAt,
                    Catering = cateringInfo,
                    HouseOwner = ownerInfo,
                    CateringOwnerInfo = cateringOwnerInfo
                });
            }

            return Ok(new { success = true, data = result });
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcomingBookings()
        {
            var userId = GetCurrentUserId();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var myHouseIds = await _context.Houses
                .Where(h => h.IdOwner == userId)
                .Select(h => h.Id)
                .ToListAsync();

            var upcoming = await _context.Bookings
                .Include(b => b.House).ThenInclude(h => h.Photos)
                .Include(b => b.User)
                .Where(b => myHouseIds.Contains(b.HouseId) && b.Approved && b.BookingDate >= today)
                .OrderBy(b => b.BookingDate)
                .Select(b => new
                {
                    b.Id,
                    b.HouseId,
                    HouseAddress = b.House.HouseInfo != null
                        ? $"{b.House.HouseInfo.City}, {b.House.HouseInfo.Street}"
                        : "Адрес не указан",
                    MainPhoto = b.House.Photos.FirstOrDefault().Photo,
                    b.BookingDate,
                    b.CreatedAt,
                    UserName = b.User.Fio
                })
                .ToListAsync();

            return Ok(new { success = true, data = upcoming });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                return null;
            return userId;
        }
    }
}