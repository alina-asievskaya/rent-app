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
        public bool Approved { get; set; } = false;

        [Column("rejected_at")]
        public DateTime? RejectedAt { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("catering_owner_id")]
        public int? CateringOwnerId { get; set; }

        [Column("catering_items_json")]
        public string? CateringItemsJson { get; set; }
    }
}