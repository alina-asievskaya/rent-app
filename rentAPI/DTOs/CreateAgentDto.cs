using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class CreateAgentDto
    {
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный формат email")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "ФИО обязательно")]
        public string Fio { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен содержать минимум 6 символов")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Номер телефона обязателен")]
        [Phone(ErrorMessage = "Некорректный формат номера телефона")]
        public string Phone_num { get; set; } = string.Empty;

        [Required(ErrorMessage = "Специализация обязательна")]
        [MaxLength(100)]
        public string Specialization { get; set; } = string.Empty;

        [Required(ErrorMessage = "Опыт работы обязателен")]
        [Range(0, 50, ErrorMessage = "Опыт должен быть от 0 до 50 лет")]
        public int Experience { get; set; } = 0;

        [MaxLength(500)]
        public string Photo { get; set; } = string.Empty;

        [Range(0, 5, ErrorMessage = "Рейтинг должен быть от 0 до 5")]
        public double Rating { get; set; } = 0;
    }
}