using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs.Bookings
{
    public class CreateBookingDto
    {
        [Required]
        public int HouseId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        public int? CateringOwnerId { get; set; }
        public List<CateringOrderItemDto>? CateringItems { get; set; }
    }
}