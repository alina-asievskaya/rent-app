using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;
using RentApp.API.DTOs.Admin;
using RentApp.API.Models;
using RentApp.API.Services;

namespace RentApp.API.Controllers.Admin
{
    [Route("api/admin/decoration")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminDecorationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CloudinaryService _cloudinaryService;
        private readonly ILogger<AdminDecorationController> _logger;

        public AdminDecorationController(AppDbContext context, CloudinaryService cloudinaryService, ILogger<AdminDecorationController> logger)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }

        // === SHOPS ===
        [HttpGet("shops")]
        public async Task<IActionResult> GetShops()
        {
            var shops = await _context.DecorationShops
                .Include(s => s.Products)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.LogoUrl,
                    ProductsCount = s.Products.Count
                })
                .ToListAsync();
            return Ok(new { success = true, data = shops });
        }

        [HttpPost("shops")]
        public async Task<IActionResult> CreateShop([FromForm] CreateDecorationShopDto dto)
        {
            try
            {
                string? logoUrl = null;
                if (dto.LogoFile != null)
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(dto.LogoFile);
                    if (uploadResult != null) logoUrl = uploadResult.Secure_url;
                }

                var shop = new DecorationShop
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    LogoUrl = logoUrl
                };
                _context.DecorationShops.Add(shop);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = shop });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating decoration shop");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("shops/{id}")]
        public async Task<IActionResult> UpdateShop(int id, [FromForm] UpdateDecorationShopDto dto)
        {
            var shop = await _context.DecorationShops.FindAsync(id);
            if (shop == null)
                return NotFound(new { success = false, message = "Магазин не найден" });

            shop.Name = dto.Name;
            shop.Description = dto.Description;

            if (dto.LogoFile != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(dto.LogoFile);
                if (uploadResult != null) shop.LogoUrl = uploadResult.Secure_url;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = shop });
        }

        [HttpDelete("shops/{id}")]
        public async Task<IActionResult> DeleteShop(int id)
        {
            var shop = await _context.DecorationShops
                .Include(s => s.Products)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (shop == null)
                return NotFound(new { success = false, message = "Магазин не найден" });

            _context.DecorationShops.Remove(shop);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        // === PRODUCTS ===
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts([FromQuery] int? shopId)
        {
            var query = _context.DecorationProducts.Include(p => p.Shop).AsQueryable();
            if (shopId.HasValue)
                query = query.Where(p => p.ShopId == shopId.Value);

            var products = await query.Select(p => new
            {
                p.Id,
                p.ShopId,
                ShopName = p.Shop.Name,
                p.Name,
                p.Description,
                p.Price,
                p.PhotoUrl,
                p.Category,
                p.IsAvailable
            }).ToListAsync();
            return Ok(new { success = true, data = products });
        }

        [HttpPost("products")]
        public async Task<IActionResult> CreateProduct([FromForm] CreateDecorationProductDto dto)
        {
            try
            {
                string? photoUrl = null;
                if (dto.PhotoFile != null)
                {
                    var uploadResult = await _cloudinaryService.UploadImageAsync(dto.PhotoFile);
                    if (uploadResult != null) photoUrl = uploadResult.Secure_url;
                }

                var product = new DecorationProduct
                {
                    ShopId = dto.ShopId,
                    Name = dto.Name,
                    Description = dto.Description,
                    Price = dto.Price,
                    PhotoUrl = photoUrl,
                    Category = dto.Category,
                    IsAvailable = dto.IsAvailable
                };
                _context.DecorationProducts.Add(product);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, data = product });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating decoration product");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateDecorationProductDto dto)
        {
            var product = await _context.DecorationProducts.FindAsync(id);
            if (product == null)
                return NotFound(new { success = false, message = "Товар не найден" });

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.Category = dto.Category;
            product.IsAvailable = dto.IsAvailable;

            if (dto.PhotoFile != null)
            {
                var uploadResult = await _cloudinaryService.UploadImageAsync(dto.PhotoFile);
                if (uploadResult != null) product.PhotoUrl = uploadResult.Secure_url;
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true, data = product });
        }

        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.DecorationProducts.FindAsync(id);
            if (product == null)
                return NotFound(new { success = false, message = "Товар не найден" });

            _context.DecorationProducts.Remove(product);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }
}