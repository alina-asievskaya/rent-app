using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Email обязателен")]
        [EmailAddress(ErrorMessage = "Некорректный формат email")]
        [MaxLength(50, ErrorMessage = "Email не должен превышать 50 символов")] // Изменено с 100 на 50
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "ФИО обязательно")]
        [MaxLength(500, ErrorMessage = "ФИО не должно превышать 500 символов")] // Добавил ограничение
        public string Fio { get; set; } = string.Empty;

        [Required(ErrorMessage = "Пароль обязателен")]
        [MinLength(6, ErrorMessage = "Пароль должен содержать минимум 6 символов")]
        [MaxLength(100, ErrorMessage = "Пароль не должен превышать 100 символов")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "Подтверждение пароля обязательно")]
        [Compare("Password", ErrorMessage = "Пароли не совпадают")]
        public string ConfirmPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Номер телефона обязателен")]
        [Phone(ErrorMessage = "Некорректный формат номера телефона")]
        [MaxLength(20, ErrorMessage = "Номер телефона не должен превышать 20 символов")]
        public string Phone_num { get; set; } = string.Empty;
    }
}