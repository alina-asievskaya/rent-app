using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class CreateReviewDto
    {
        [Required(ErrorMessage = "Рейтинг обязателен")]
        [Range(1, 5, ErrorMessage = "Рейтинг должен быть от 1 до 5")]
        public int Rating { get; set; }

        [Required(ErrorMessage = "Текст отзыва обязателен")]
        [MinLength(10, ErrorMessage = "Отзыв должен содержать минимум 10 символов")]
        [MaxLength(1000, ErrorMessage = "Отзыв не должен превышать 1000 символов")]
        public string Text { get; set; } = string.Empty;
    }
}