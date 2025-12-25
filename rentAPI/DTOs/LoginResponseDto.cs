namespace RentApp.API.DTOs
{
    public class LoginResponseDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Fio { get; set; } = string.Empty;
        public string Phone_num { get; set; } = string.Empty;
        public bool Id_agent { get; set; }
        public string Token { get; set; } = string.Empty;
    }
}