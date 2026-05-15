using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Data;

namespace RentApp.API.Controllers
{
    [Route("api/food")]
    [ApiController]
    [AllowAnonymous]
    public class FoodController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FoodController(AppDbContext context) => _context = context;

        [HttpGet("menu")]
        public async Task<IActionResult> GetMenu()
        {
            var items = await _context.MenuItems
                .Include(m => m.Restaurant)
                .Where(m => m.IsAvailable)
                .Select(m => new
                {
                    m.Id,
                    RestaurantName = m.Restaurant.Name,
                    m.Name,
                    m.Description,
                    m.Price,
                    m.PhotoUrl
                })
                .ToListAsync();
            return Ok(items);
        }
    }
}