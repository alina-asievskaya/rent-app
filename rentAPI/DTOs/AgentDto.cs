using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class AgentDto
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Fio { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [Phone]
        public string Phone { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Specialization { get; set; } = string.Empty;
        
        [Required]
        [Range(0, 50)]
        public int Experience { get; set; }
        
        [Required]
        [Range(0, 5)]
        public double Rating { get; set; }
        
        [MaxLength(500)]
        public string Photo { get; set; } = string.Empty;
        
        public int ReviewsCount { get; set; }
        public List<string> Specialties { get; set; } = new();
        
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;
        
        [MaxLength(200)]
        public string Position { get; set; } = string.Empty;
    }

    public class AgentCatalogDto
    {
        public List<AgentDto> Agents { get; set; } = new();
        public int TotalCount { get; set; }
        public Dictionary<string, List<string>> Filters { get; set; } = new();
    }

    public class AgentFilterDto
    {
        public string? Specialty { get; set; }
        public string? Experience { get; set; }
        public string? Rating { get; set; }
        public string? Search { get; set; }
        public string SortBy { get; set; } = "rating-desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}