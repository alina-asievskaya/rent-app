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
    public class ServiceRequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServiceRequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOffer([FromBody] CreateOfferDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
                return Unauthorized(new { success = false, message = "Не удалось идентифицировать пользователя" });

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return BadRequest(new { success = false, message = "Пользователь не найден" });

            if (string.IsNullOrWhiteSpace(dto.ServiceType) ||
                string.IsNullOrWhiteSpace(dto.CompanyName) ||
                string.IsNullOrWhiteSpace(dto.City) ||
                string.IsNullOrWhiteSpace(dto.Description))
            {
                return BadRequest(new { success = false, message = "Заполните все поля" });
            }

            if (dto.Description.Length > 2000)
                return BadRequest(new { success = false, message = "Описание не более 2000 символов" });

            var request = new ServiceRequest
            {
                UserId = userId,
                ServiceType = dto.ServiceType,
                CompanyName = dto.CompanyName,
                City = dto.City,
                Description = dto.Description,
                Phone = user.Phone_num,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.ServiceRequests.Add(request);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Заявка отправлена администратору", data = new { id = request.Id } });
        }
    }
}