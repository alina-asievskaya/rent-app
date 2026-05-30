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
        public bool Approved { get; set; } = false;  // изменено: по умолчанию false (ожидает)

        [Column("rejected_at")]                     // новое поле
        public DateTime? RejectedAt { get; set; }    // null - не отклонено

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}