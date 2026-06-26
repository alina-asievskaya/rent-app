using System;
using System.Collections.Generic;

namespace RentApp.API.DTOs
{
    public class CateringOrderItemDto
    {
        public int MenuItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateCateringOrderDto
    {
        public int BookingId { get; set; }
        public int CateringOwnerId { get; set; }
        public List<CateringOrderItemDto> Items { get; set; } = new();
    }

    public class CateringOrderResponseDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int CateringOwnerId { get; set; }
        public string CateringCompanyName { get; set; } = string.Empty;
        public int HouseId { get; set; }
        public string HouseAddress { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserPhone { get; set; } = string.Empty;
        public string ItemsJson { get; set; } = string.Empty;
        public List<CateringOrderItemDto> Items { get; set; } = new();
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public string? BookingDate { get; set; }
    }

    public class UpdateCateringOrderStatusDto
    {
        public string Status { get; set; } = string.Empty; 
    }
}