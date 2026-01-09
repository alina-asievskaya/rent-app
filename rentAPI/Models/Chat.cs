using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Chats")]
    public class Chat
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_chat")]
        public int Id { get; set; }

        [Required]
        [Column("id_user1")]
        public int User1Id { get; set; }

        [Required]
        [Column("id_user2")]
        public int User2Id { get; set; }

        [Column("id_house")]
        public int? HouseId { get; set; } // Делаем nullable для чатов с агентами

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Навигационные свойства
        [ForeignKey("User1Id")]
        public User User1 { get; set; } = null!;

        [ForeignKey("User2Id")]
        public User User2 { get; set; } = null!;

        [ForeignKey("HouseId")]
        public House? House { get; set; }

        public ICollection<Message> Messages { get; set; } = new List<Message>();

        // Вспомогательные свойства (не отображаются в БД)
        [NotMapped]
        public string LastMessage { get; set; } = string.Empty;

        [NotMapped]
        public DateTime? LastMessageTime { get; set; }

        [NotMapped]
        public int UnreadCount { get; set; }

        [NotMapped]
        public User OtherUser { get; set; } = null!;

        [NotMapped]
        public bool IsCurrentUserUser1 { get; set; }
    }
}