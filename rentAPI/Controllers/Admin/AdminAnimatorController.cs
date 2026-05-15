using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs.Admin;
using RentApp.API.Models;
using RentApp.API.Services;

namespace RentApp.API.Controllers.Admin
{
    [Route("api/admin/animator")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminAnimatorController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;
        private readonly ILogger<AdminAnimatorController> _logger;

        public AdminAnimatorController(AppDbContext context, CloudinaryService cloudinaryService, ILogger<AdminAnimatorController> logger)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }

        // === COMPANIES ===
        [HttpGet("companies")]
        public async Task<IActionResult> GetCompanies()
        {
            var companies = await _context.AnimatorCompanies
                .Include(c => c.Services)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.Description,
                    c.LogoUrl,
                    c.ContactPhone,
                    c.ContactEmail,
                    ServicesCount = c.Services.Count
                })
                .ToListAsync();
            return Ok(new { success = true, data = companies });
        }

        [HttpPost("companies")]
        public async Task<IActionResult> CreateCompany([FromForm] CreateAnimatorCompanyDto dto)
        {
            try
            {
                string? logoUrl = null;
                if (dto.LogoFile != null)
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(dto.LogoFile);
                    if (uploadResult != null) logoUrl = uploadResult.Secure_url;
                }

                var company = new AnimatorCompany
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    LogoUrl = logoUrl,
                    ContactPhone = dto.ContactPhone,
                    ContactEmail = dto.ContactEmail
                };
                _context.AnimatorCompanies.Add(company);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = company });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating animator company");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("companies/{id}")]
        public async Task<IActionResult> UpdateCompany(int id, [FromForm] UpdateAnimatorCompanyDto dto)
        {
            var company = await _context.AnimatorCompanies.FindAsync(id);
            if (company == null)
                return NotFound(new { success = false, message = "Компания не найдена" });

            company.Name = dto.Name;
            company.Description = dto.Description;
            company.ContactPhone = dto.ContactPhone;
            company.ContactEmail = dto.ContactEmail;

            if (dto.LogoFile != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(dto.LogoFile);
                if (uploadResult != null) company.LogoUrl = uploadResult.Secure_url;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = company });
        }

        [HttpDelete("companies/{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var company = await _context.AnimatorCompanies
                .Include(c => c.Services)
                .FirstOrDefaultAsync(c => c.Id == id);
            if (company == null)
                return NotFound(new { success = false, message = "Компания не найдена" });

            _context.AnimatorCompanies.Remove(company);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // === SERVICES ===
        [HttpGet("services")]
        public async Task<IActionResult> GetServices([FromQuery] int? companyId)
        {
            var query = _context.AnimatorServices.Include(s => s.Company).AsQueryable();
            if (companyId.HasValue)
                query = query.Where(s => s.CompanyId == companyId.Value);

            var services = await query.Select(s => new
            {
                s.Id,
                s.CompanyId,
                CompanyName = s.Company.Name,
                s.ServiceName,
                s.Description,
                s.Price,
                s.PhotoUrl,
                s.IsAvailable
            }).ToListAsync();
            return Ok(new { success = true, data = services });
        }

        [HttpPost("services")]
        public async Task<IActionResult> CreateService([FromForm] CreateAnimatorServiceDto dto)
        {
            try
            {
                string? photoUrl = null;
                if (dto.PhotoFile != null)
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(dto.PhotoFile);
                    if (uploadResult != null) photoUrl = uploadResult.Secure_url;
                }

                var service = new AnimatorService
                {
                    CompanyId = dto.CompanyId,
                    ServiceName = dto.ServiceName,
                    Description = dto.Description,
                    Price = dto.Price,
                    PhotoUrl = photoUrl,
                    IsAvailable = dto.IsAvailable
                };
                _context.AnimatorServices.Add(service);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = service });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating animator service");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("services/{id}")]
        public async Task<IActionResult> UpdateService(int id, [FromForm] UpdateAnimatorServiceDto dto)
        {
            var service = await _context.AnimatorServices.FindAsync(id);
            if (service == null)
                return NotFound(new { success = false, message = "Услуга не найдена" });

            service.ServiceName = dto.ServiceName;
            service.Description = dto.Description;
            service.Price = dto.Price;
            service.IsAvailable = dto.IsAvailable;

            if (dto.PhotoFile != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(dto.PhotoFile);
                if (uploadResult != null) service.PhotoUrl = uploadResult.Secure_url;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = service });
        }

        [HttpDelete("services/{id}")]
        public async Task<IActionResult> DeleteService(int id)
        {
            var service = await _context.AnimatorServices.FindAsync(id);
            if (service == null)
                return NotFound(new { success = false, message = "Услуга не найдена" });

            _context.AnimatorServices.Remove(service);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}