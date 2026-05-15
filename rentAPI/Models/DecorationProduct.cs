using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("DecorationProducts")]
    public class DecorationProduct
    {
        [Key]
        [Column("id_decoration_product")]
        public int Id { get; set; }

        [Required]
        [Column("id_shop")]
        public int ShopId { get; set; }

        [ForeignKey(nameof(ShopId))]
        public DecorationShop Shop { get; set; } = null!;

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        [MaxLength(500)]
        public string? Description { get; set; }

        [Column("price")]
        public decimal Price { get; set; }

        [Column("photo_url")]
        [MaxLength(500)]
        public string? PhotoUrl { get; set; }

        [Column("category")]
        [MaxLength(100)]
        public string? Category { get; set; }

        [Column("is_available")]
        public bool IsAvailable { get; set; } = true;
    }
}