// RentApp.API/DTOs/AgentDto.cs
using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class AgentDto
    {
        public int Id { get; set; }
        public string Fio { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public int Experience { get; set; }
        public double Rating { get; set; }
        public string Photo { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public int ReviewsCount { get; set; }
        public int PropertiesManaged { get; set; }
        public List<string> Specialties { get; set; } = new();
        public string Description { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public int SatisfactionRate { get; set; }
    }

    public class AgentCatalogDto
    {
        public List<AgentDto> Agents { get; set; } = new();
        public int TotalCount { get; set; }
        public Dictionary<string, List<string>> Filters { get; set; } = new();
    }

    public class AgentFilterDto
    {
        public string? City { get; set; }
        public string? Specialty { get; set; }
        public string? Experience { get; set; }
        public string? Rating { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; } = "rating-desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}