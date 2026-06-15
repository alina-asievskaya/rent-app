// RentApp.API/DTOs/Bookings/BookingWithCateringDto.cs
using System;

namespace RentApp.API.DTOs.Bookings
{
    public class BookingWithCateringDto
    {
        public int Id { get; set; }
        public int HouseId { get; set; }
        public string HouseAddress { get; set; } = string.Empty;
        public string? MainPhoto { get; set; }
        public DateOnly BookingDate { get; set; }
        public bool Approved { get; set; }
        public DateTime? RejectedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public CateringOrderInfoDto? Catering { get; set; }
        
        // НОВЫЕ ПОЛЯ
        public OwnerInfoDto HouseOwner { get; set; } = new();
        public OwnerInfoDto? CateringOwnerInfo { get; set; } // может быть null, если кейтеринг не заказан
        
    }

    public class OwnerInfoDto
    {
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}