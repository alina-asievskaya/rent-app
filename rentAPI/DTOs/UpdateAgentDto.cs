// RentApp.API/DTOs/UpdateAgentDto.cs
using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class UpdateAgentDto
    {
        [MaxLength(100)]
        public string? Fio { get; set; }

        [Phone(ErrorMessage = "Некорректный формат номера телефона")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Specialization { get; set; }

        [Range(0, 50, ErrorMessage = "Опыт должен быть от 0 до 50 лет")]
        public int? Experience { get; set; }

        [MaxLength(500)]
        public string? Photo { get; set; }

        [Range(0, 5, ErrorMessage = "Рейтинг должен быть от 0 до 5")]
        public double? Rating { get; set; }

        [MaxLength(100)]
        public string? City { get; set; }

        [MaxLength(500)]
        public string? Bio { get; set; }
    }
}