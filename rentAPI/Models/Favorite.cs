using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Favorites")]
    public class Favorite
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_favorites")]
        public int Id { get; set; }

        [Required]
        [Column("id_user")]
        public int UserId { get; set; }

        [Required]
        [Column("id_house")]
        public int HouseId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Навигационные свойства
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        [ForeignKey("HouseId")]
        public virtual House House { get; set; }
    }
}