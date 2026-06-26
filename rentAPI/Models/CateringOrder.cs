using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("CateringOrders")]
    public class CateringOrder
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("booking_id")]
        public int BookingId { get; set; }

        [Required]
        [Column("catering_owner_id")]
        public int CateringOwnerId { get; set; }

        [Required]
        [Column("house_id")]
        public int HouseId { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Column("items_json")]
        public string ItemsJson { get; set; } = "[]"; 

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; 

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("responded_at")]
        public DateTime? RespondedAt { get; set; }

        [ForeignKey("BookingId")]
        public Booking Booking { get; set; } = null!;

        [ForeignKey("CateringOwnerId")]
        public CateringOwner CateringOwner { get; set; } = null!;

        [ForeignKey("HouseId")]
        public House House { get; set; } = null!;

        [ForeignKey("UserId")]
        public User User { get; set; } = null!;
    }
}