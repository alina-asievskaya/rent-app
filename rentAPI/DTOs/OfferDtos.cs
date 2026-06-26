using System;

namespace RentApp.API.DTOs
{
    public class CreateOfferDto
    {
        public string ServiceType { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class OfferResponseDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserFio { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateOfferStatusDto
    {
        public string Status { get; set; } = string.Empty; 
    }
}