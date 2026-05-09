using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    public class BookingFoodItem
    {
        [Key]
        [Column("id_booking_food")]
        public int Id { get; set; }

        [Required]
        [Column("id_booking")]
        public int BookingId { get; set; }

        [ForeignKey("BookingId")]
        public Booking Booking { get; set; }

        [Required]
        [Column("restaurant_name")]
        [MaxLength(100)]
        public string RestaurantName { get; set; }

        [Required]
        [Column("item_name")]
        [MaxLength(200)]
        public string ItemName { get; set; }

        [Column("price", TypeName = "decimal(10,2)")]
        public decimal Price { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; } = 1;
    }
}