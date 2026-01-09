using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Messages")]
    public class Message
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_message")]
        public int Id { get; set; }

        [Required]
        [Column("id_chat")]
        public int ChatId { get; set; }

        [Required]
        [Column("id_sender")]
        public int SenderId { get; set; }

        [Required]
        [MaxLength(2000)]
        [Column("message")]
        public string Text { get; set; } = string.Empty;

        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Навигационные свойства
        [ForeignKey("ChatId")]
        public Chat Chat { get; set; } = null!;

        [ForeignKey("SenderId")]
        public User Sender { get; set; } = null!;
    }
}