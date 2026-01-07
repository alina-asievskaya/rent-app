using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Houses_info")]
    public class HouseInfo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("id_house")]
        public int IdHouse { get; set; }

        [Required]
        [Column("region")]
        [MaxLength(100)]
        public string Region { get; set; } = string.Empty;

        [Required]
        [Column("city")]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;
    
        [Required]
        [Column("street")]
        [MaxLength(200)]
        public string Street { get; set; } = string.Empty;

        [Required]
        [Column("rooms")]
        public int Rooms { get; set; }

        [Required]
        [Column("bathrooms")]
        public int Bathrooms { get; set; }

        [Required]
        [Column("floor")]
        public int Floor { get; set; }

        // Навигационное свойство
        public House House { get; set; } = null!;
    }
}