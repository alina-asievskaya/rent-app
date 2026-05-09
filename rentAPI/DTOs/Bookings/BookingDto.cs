namespace RentApp.API.DTOs.Bookings
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int HouseId { get; set; }
        public int UserId { get; set; }
        public DateOnly BookingDate { get; set; }
        public bool Approved { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<BookingFoodItemDto> FoodItems { get; set; }
        public List<BookingDecorationItemDto> DecorationItems { get; set; }
    }
}