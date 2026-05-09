namespace RentApp.API.DTOs
{
    public class CloudinaryUploadResult
    {
        public string Secure_url { get; set; } = string.Empty;
        public string Public_id { get; set; } = string.Empty;
        public int Width { get; set; }
        public int Height { get; set; }
        public string Format { get; set; } = string.Empty;
    }
}