using Microsoft.AspNetCore.Http;

namespace RentApp.API.DTOs.Admin
{
    public class CreateAnimatorCompanyDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public IFormFile? LogoFile { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactEmail { get; set; }
    }

    public class UpdateAnimatorCompanyDto : CreateAnimatorCompanyDto
    {
        public int Id { get; set; }
    }
}