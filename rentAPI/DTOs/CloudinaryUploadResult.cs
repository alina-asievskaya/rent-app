// CloudinaryUploadResult.cs
namespace RentApp.API.DTOs
{
    public class CloudinaryUploadResult
    {
        public string Secure_url { get; set; } // URL для HTTPS-доступа
        public string Public_id { get; set; }  // Публичный идентификатор
        public int Width { get; set; }
        public int Height { get; set; }
        public string Format { get; set; }
    }
}