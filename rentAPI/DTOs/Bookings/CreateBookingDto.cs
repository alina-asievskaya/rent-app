using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs.Bookings
{
    public class CreateBookingDto
    {
        [Required]
        public int HouseId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; } // будет преобразовано в DateOnly

        public List<BookingFoodItemDto> FoodItems { get; set; } = new();
        public List<BookingDecorationItemDto> DecorationItems { get; set; } = new();
    }

    public class BookingFoodItemDto
    {
        [Required]
        public string RestaurantName { get; set; }
        [Required]
        public string ItemName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class BookingDecorationItemDto
    {
        [Required]
        public string Category { get; set; }
        [Required]
        public string ItemName { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
    }
}