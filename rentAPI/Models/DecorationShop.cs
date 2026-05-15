using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("DecorationShops")]
    public class DecorationShop
    {
        [Key]
        [Column("id_decoration_shop")]
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

        public ICollection<DecorationProduct> Products { get; set; } = new List<DecorationProduct>();
    }
}