using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Feedback")]
    public class Feedback
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_feedback")]
        public int Id { get; set; }

        [Required]
        [Column("id_user")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("topic")]
        public string Topic { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        [Column("text")]
        public string Text { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Навигационное свойство
        public User User { get; set; } = null!;
    }
}