using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class AgentReviewDto
    {
        public int Id { get; set; }
        
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        
        public int AgentId { get; set; }
        
        public int Rating { get; set; }
        
        public string Text { get; set; } = string.Empty;
        
        public DateTime DataReviews { get; set; }
        
        public string FormattedDate { get; set; } = string.Empty;
    }

    public class CreateAgentReviewDto
    {
        [Required]
        [Range(1, 5, ErrorMessage = "Рейтинг должен быть от 1 до 5")]
        public int Rating { get; set; }
        
        [Required]
        [MinLength(10, ErrorMessage = "Текст отзыва должен содержать минимум 10 символов")]
        [MaxLength(2000, ErrorMessage = "Текст отзыва не должен превышать 2000 символов")]
        public string Text { get; set; } = string.Empty;
    }
}