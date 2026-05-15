using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("AnimatorCompanies")]
    public class AnimatorCompany
    {
        [Key]
        [Column("id_animator_company")]
        public int Id { get; set; }

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        [MaxLength(500)]
        public string? Description { get; set; }

        [Column("logo_url")]
        [MaxLength(500)]
        public string? LogoUrl { get; set; }

        [Column("contact_phone")]
        [MaxLength(20)]
        public string? ContactPhone { get; set; }

        [Column("contact_email")]
        [MaxLength(100)]
        public string? ContactEmail { get; set; }

        public ICollection<AnimatorService> Services { get; set; } = new List<AnimatorService>();
    }
}