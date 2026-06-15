using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("SupportReplies")]
    public class SupportReply
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("feedback_id")]
        public int FeedbackId { get; set; }

        [Required]
        [Column("admin_id")]
        public int AdminId { get; set; }

        [Required]
        [MaxLength(2000)]
        [Column("message")]
        public string Message { get; set; } = string.Empty;

        [Column("created_at")]
        public DateOnly CreatedAt { get; set; }

        public Feedback Feedback { get; set; } = null!;
        public User Admin { get; set; } = null!;
    }
}