using RentApp.API.DTOs;

namespace RentApp.API.Services
{
    public interface ICloudinaryService
    {
        Task<CloudinaryUploadResult?> UploadImageAsync(IFormFile file);
    }
}