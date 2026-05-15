using Microsoft.AspNetCore.Http;

namespace RentApp.API.DTOs.Admin
{
    public class CreateMenuItemDto
    {
        public int RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public IFormFile? PhotoFile { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    public class UpdateMenuItemDto : CreateMenuItemDto
    {
        public int Id { get; set; }
    }
}