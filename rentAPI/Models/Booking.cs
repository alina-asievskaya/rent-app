using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    public class Booking
    {
        [Key]
        [Column("id_booking")]
        public int Id { get; set; }

        [Required]
        [Column("id_house")]
        public int HouseId { get; set; }

        [ForeignKey("HouseId")]
        public House House { get; set; }

        [Required]
        [Column("id_user")]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        [Column("booking_date")]
        public DateOnly BookingDate { get; set; }

        [Column("approved")]
        public bool Approved { get; set; } = true; // пока всегда true

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Навигационные свойства для составных частей бронирования
        public ICollection<BookingFoodItem> FoodItems { get; set; }
        public ICollection<BookingDecorationItem> DecorationItems { get; set; }
    }
}