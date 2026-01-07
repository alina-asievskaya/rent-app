using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("AgentReviews")]
    public class AgentReview
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_rew_agent")]
        public int Id { get; set; }

        [Required]
        [Column("id_user")]
        public int UserId { get; set; }

        [Required]
        [Column("id_agent")]
        public int AgentId { get; set; }

        [Required]
        [Range(1, 5)]
        [Column("rating")]
        public int Rating { get; set; }

        [Required]
        [MaxLength(2000)]
        [Column("text")]
        public string Text { get; set; } = string.Empty;

        [Column("data_reviews")]
        [DataType(DataType.Date)]
        public DateTime DataReviews { get; set; } = DateTime.UtcNow.Date;

        // Навигационные свойства
        public User User { get; set; } = null!;
        public Agent Agent { get; set; } = null!;
    }
}