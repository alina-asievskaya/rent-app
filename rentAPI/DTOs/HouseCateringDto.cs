namespace RentApp.API.DTOs
{
    public class HouseCateringDto
    {
        public int Id { get; set; }
        public int CateringOwnerId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateHouseCateringsDto
    {
        public List<int> CateringOwnerIds { get; set; } = new();
    }
}