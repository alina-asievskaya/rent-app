using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class CreateFeedbackDto
    {
        [Required(ErrorMessage = "Тема обращения обязательна")]
        [MaxLength(100, ErrorMessage = "Тема не должна превышать 100 символов")]
        public string Topic { get; set; } = string.Empty;

        [Required(ErrorMessage = "Сообщение обязательно")]
        [MaxLength(2000, ErrorMessage = "Сообщение не должно превышать 2000 символов")]
        public string Text { get; set; } = string.Empty;
    }
}