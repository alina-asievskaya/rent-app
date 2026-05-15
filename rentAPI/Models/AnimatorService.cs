using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("AnimatorServices")]
    public class AnimatorService
    {
        [Key]
        [Column("id_animator_service")]
        public int Id { get; set; }

        [Required]
        [Column("id_company")]
        public int CompanyId { get; set; }

        [ForeignKey(nameof(CompanyId))]
        public AnimatorCompany Company { get; set; } = null!;

        [Required]
        [Column("service_name")]
        [MaxLength(200)]
        public string ServiceName { get; set; } = string.Empty;

        [Column("description")]
        [MaxLength(500)]
        public string? Description { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        [Column("photo_url")]
        [MaxLength(500)]
        public string? PhotoUrl { get; set; }

        [Column("is_available")]
        public bool IsAvailable { get; set; } = true;
    }
}