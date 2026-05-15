using Microsoft.AspNetCore.Http;

namespace RentApp.API.DTOs.Admin
{
    public class CreateDecorationProductDto
    {
        public int ShopId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public IFormFile? PhotoFile { get; set; }
        public string? Category { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    public class UpdateDecorationProductDto : CreateDecorationProductDto
    {
        public int Id { get; set; }
    }
}