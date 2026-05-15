using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;

namespace RentApp.API.Controllers
{
    [Route("api/decorations")]
    [ApiController]
    [AllowAnonymous]
    public class DecorationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public DecorationsController(AppDbContext context) => _context = context;

        [HttpGet("items")]
        public async Task<IActionResult> GetDecorationItems()
        {
            // Украшения
            var decorations = await _context.DecorationProducts
                .Include(p => p.Shop)
                .Where(p => p.IsAvailable)
                .Select(p => new
                {
                    p.Id,
                    Category = p.Category ?? "Украшения",
                    ItemName = p.Name,
                    Price = p.Price,
                    PhotoUrl = p.PhotoUrl,
                    Type = "Decoration"
                })
                .ToListAsync();

            // Аниматоры (услуги)
            var animators = await _context.AnimatorServices
                .Include(s => s.Company)
                .Where(s => s.IsAvailable)
                .Select(s => new
                {
                    s.Id,
                    Category = "Аниматоры",
                    ItemName = s.ServiceName,
                    Price = s.Price,
                    PhotoUrl = s.PhotoUrl,
                    Type = "Animator"
                })
                .ToListAsync();

            var result = decorations.Concat(animators);
            return Ok(result);
        }
    }
}