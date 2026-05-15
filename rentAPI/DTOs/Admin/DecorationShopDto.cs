using Microsoft.AspNetCore.Http;

namespace RentApp.API.DTOs.Admin
{
    public class CreateDecorationShopDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public IFormFile? LogoFile { get; set; }
    }

    public class UpdateDecorationShopDto : CreateDecorationShopDto
    {
        public int Id { get; set; }
    }
}