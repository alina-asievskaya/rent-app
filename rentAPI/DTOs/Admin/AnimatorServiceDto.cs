using Microsoft.AspNetCore.Http;

namespace RentApp.API.DTOs.Admin
{
    public class CreateAnimatorServiceDto
    {
        public int CompanyId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public IFormFile? PhotoFile { get; set; }
        public bool IsAvailable { get; set; } = true;
    }

    public class UpdateAnimatorServiceDto : CreateAnimatorServiceDto
    {
        public int Id { get; set; }
    }
}