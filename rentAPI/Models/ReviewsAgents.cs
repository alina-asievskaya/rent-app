using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Reviews_agents")]
    public class ReviewAgent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("id_user")]
        public int UserId { get; set; }

        [Required]
        [Column("rating")]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [Column("text")]
        [MaxLength(1000)]
        public string Text { get; set; } = string.Empty;

        [Required]
        [Column("id_agent")]
        public int AgentId { get; set; }

        [Required]
        [Column("data_reviews")]
        public DateOnly DataReviews { get; set; }

        // Навигационные свойства
        public User User { get; set; } = null!;
        public Agent Agent { get; set; } = null!;
    }
}