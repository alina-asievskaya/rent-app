namespace RentApp.API.DTOs
{
    public class AgentDetailsDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Fio { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public int Experience { get; set; }
        public double Rating { get; set; }
        public string Photo { get; set; } = string.Empty;
        public int ReviewsCount { get; set; }
        public bool IsAgent { get; set; } = true;
    }
}