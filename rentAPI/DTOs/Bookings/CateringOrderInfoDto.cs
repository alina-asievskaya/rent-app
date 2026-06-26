using System.Collections.Generic;

namespace RentApp.API.DTOs.Bookings
{
    public class CateringOrderInfoDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<CateringOrderItemDto> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }
    }
}