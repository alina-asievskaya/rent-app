using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class UpdateProfileDto
    {
        [MaxLength(150, ErrorMessage = "ФИО не должно превышать 150 символов")]
        public string Fio { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Некорректный формат номера телефона")]
        [MaxLength(20, ErrorMessage = "Номер телефона не должен превышать 20 символов")]
        public string Phone_num { get; set; } = string.Empty;
    }
}