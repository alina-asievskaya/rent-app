using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("MenuItems")]
    public class MenuItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("catering_owner_id")]
        public int CateringOwnerId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("price")]
        public decimal? Price { get; set; }

        [Column("weight_grams")]
        public int? WeightGrams { get; set; }

        [MaxLength(500)]
        [Column("photo_url")]
        public string PhotoUrl { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("CateringOwnerId")]
        public virtual CateringOwner CateringOwner { get; set; } = null!;
    }
}