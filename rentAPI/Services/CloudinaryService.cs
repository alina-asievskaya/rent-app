using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using RentApp.API.DTOs;

namespace RentApp.API.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
        }

       public async Task<CloudinaryUploadResult?> UploadImageAsync(IFormFile file)
{
    if (file == null || file.Length == 0)
        return null;

    await using var stream = file.OpenReadStream();
    var uploadParams = new ImageUploadParams
    {
        File = new FileDescription(file.FileName, stream),
        Folder = "rentapp_chat_images"
        // Transformation убран – подпись не требуется
    };

    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
    if (uploadResult.Error != null)
        throw new Exception(uploadResult.Error.Message);

    return new CloudinaryUploadResult
    {
        Secure_url = uploadResult.SecureUrl.ToString(),
        Public_id = uploadResult.PublicId,
        Width = uploadResult.Width,
        Height = uploadResult.Height,
        Format = uploadResult.Format
    };
}
    }
}