using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class UpdateAgentDto
    {
        [MaxLength(100)]
        public string? Fio { get; set; }

        [Phone]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(100)]
        public string? Specialization { get; set; }

        [Range(0, 50)]
        public int? Experience { get; set; }

        [MaxLength(500)]
        public string? Photo { get; set; }

        [Range(0, 5)]
        public double? Rating { get; set; }

        [MaxLength(2000)]
        public string? DisplayName { get; set; }

        public List<string>? PortfolioPhotos { get; set; }

        [Range(0, 999999)]
        public decimal? Price { get; set; }
    }
}