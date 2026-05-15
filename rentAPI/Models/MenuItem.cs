using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("MenuItems")]
    public class MenuItem
    {
        [Key]
        [Column("id_menu_item")]
        public int Id { get; set; }

        [Required]
        [Column("id_restaurant")]
        public int RestaurantId { get; set; }

        [ForeignKey(nameof(RestaurantId))]
        public Restaurant Restaurant { get; set; } = null!;

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

        [Column("is_available")]
        public bool IsAvailable { get; set; } = true;
    }
}