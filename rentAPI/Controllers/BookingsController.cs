using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs.Bookings;
using RentApp.API.Models;
using System.Security.Claims;

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

        // POST: api/bookings
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

                var bookingDate = DateOnly.FromDateTime(dto.BookingDate);
                var existingApproved = await _context.Bookings
                    .AnyAsync(b => b.HouseId == dto.HouseId && b.BookingDate == bookingDate && b.Approved);
                if (existingApproved)
                    return BadRequest(new { success = false, message = "Выбранная дата уже занята" });

                var booking = new Booking
                {
                    HouseId = dto.HouseId,
                    UserId = userId,
                    BookingDate = bookingDate,
                    Approved = false, // Ожидает подтверждения владельцем
                    CreatedAt = DateTime.UtcNow
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                if (dto.FoodItems != null && dto.FoodItems.Any())
                {
                    foreach (var food in dto.FoodItems)
                    {
                        _context.BookingFoodItems.Add(new BookingFoodItem
                        {
                            BookingId = booking.Id,
                            RestaurantName = food.RestaurantName,
                            ItemName = food.ItemName,
                            Price = food.Price,
                            Quantity = food.Quantity
                        });
                    }
                }

                if (dto.DecorationItems != null && dto.DecorationItems.Any())
                {
                    foreach (var dec in dto.DecorationItems)
                    {
                        _context.BookingDecorationItems.Add(new BookingDecorationItem
                        {
                            BookingId = booking.Id,
                            Category = dec.Category,
                            ItemName = dec.ItemName,
                            Price = dec.Price,
                            Quantity = dec.Quantity
                        });
                    }
                }

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

        // GET: api/bookings/check-availability?houseId=1&date=2026-04-17
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

        // GET: api/bookings/house/{houseId}/booked-dates
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

        // GET: api/bookings/incoming-requests – заявки для владельца (неподтверждённые)
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
                .Where(b => myHouseIds.Contains(b.HouseId) && !b.Approved)
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

        // POST: api/bookings/{id}/approve
        [HttpPost("{id}/approve")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            var userId = GetCurrentUserId();
            var booking = await _context.Bookings
                .Include(b => b.House)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();
            if (booking.House.IdOwner != userId) return Forbid();

            booking.Approved = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // POST: api/bookings/{id}/reject
        [HttpPost("{id}/reject")]
        public async Task<IActionResult> RejectBooking(int id)
        {
            var userId = GetCurrentUserId();
            var booking = await _context.Bookings
                .Include(b => b.House)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return NotFound();
            if (booking.House.IdOwner != userId) return Forbid();

            // Удаляем отклонённую заявку
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // GET: api/bookings/user-bookings – все бронирования текущего пользователя
        [HttpGet("user-bookings")]
        public async Task<IActionResult> GetUserBookings()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var bookings = await _context.Bookings
                .Include(b => b.House).ThenInclude(h => h.Photos)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new
                {
                    b.Id,
                    b.HouseId,
                    HouseAddress = b.House.HouseInfo != null
                        ? $"{b.House.HouseInfo.City}, {b.House.HouseInfo.Street}"
                        : "Адрес не указан",
                    MainPhoto = b.House.Photos.FirstOrDefault().Photo,
                    b.BookingDate,
                    b.Approved,
                    b.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, data = bookings });
        }

        // GET: api/bookings/history – прошедшие бронирования пользователя
        [HttpGet("history")]
        public async Task<IActionResult> GetBookingHistory()
        {
            var userId = GetCurrentUserId();
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var pastBookings = await _context.Bookings
                .Include(b => b.House).ThenInclude(h => h.Photos)
                .Where(b => b.UserId == userId && b.BookingDate < today)
                .OrderByDescending(b => b.BookingDate)
                .Select(b => new
                {
                    b.Id,
                    b.HouseId,
                    HouseAddress = b.House.HouseInfo != null
                        ? $"{b.House.HouseInfo.City}, {b.House.HouseInfo.Street}"
                        : "Адрес не указан",
                    MainPhoto = b.House.Photos.FirstOrDefault().Photo,
                    b.BookingDate,
                    b.Approved,
                    b.CreatedAt
                })
                .ToListAsync();

            return Ok(new { success = true, data = pastBookings });
        }

        // GET: api/bookings/upcoming – будущие подтверждённые бронирования для владельца
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