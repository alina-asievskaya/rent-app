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
    public class CateringController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CateringController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-status")]
        public async Task<IActionResult> GetMyStatus()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var owner = await _context.CateringOwners
                .FirstOrDefaultAsync(c => c.UserId == userId);
            return Ok(new { isOwner = owner != null });
        }

        [HttpGet("my-info")]
        public async Task<IActionResult> GetMyInfo()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var owner = await _context.CateringOwners
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if (owner == null)
                return Ok(new { success = false, message = "Вы не являетесь владельцем кейтеринга" });

            return Ok(new { success = true, companyName = owner.CompanyName, city = owner.City, description = owner.Description, phone = owner.Phone });
        }

        [HttpPut("update-company")]
        public async Task<IActionResult> UpdateCompany([FromBody] UpdateCompanyDto dto)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var owner = await _context.CateringOwners
                .FirstOrDefaultAsync(c => c.UserId == userId);
            if (owner == null)
                return BadRequest(new { success = false, message = "Вы не являетесь владельцем кейтеринга" });

            if (string.IsNullOrWhiteSpace(dto.CompanyName))
                return BadRequest(new { success = false, message = "Название компании не может быть пустым" });

            owner.CompanyName = dto.CompanyName;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Название компании обновлено" });
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