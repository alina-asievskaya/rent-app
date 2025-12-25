using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Convenience")]
    public class Convenience
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("id_house")]
        public int IdHouse { get; set; }

        [Column("conditioner")]
        public bool Conditioner { get; set; }

        [Column("furniture")]
        public bool Furniture { get; set; }

        [Column("internet")]
        public bool Internet { get; set; }

        [Column("security")]
        public bool Security { get; set; }

        [Column("video_surveillance")]
        public bool VideoSurveillance { get; set; }

        [Column("fire_alarm")]
        public bool FireAlarm { get; set; }

        [Column("parking")]
        public bool Parking { get; set; }

        [Column("garage")]
        public bool Garage { get; set; }

        [Column("garden")]
        public bool Garden { get; set; }

        [Column("swimming_pool")]
        public bool SwimmingPool { get; set; }

        [Column("sauna")]
        public bool Sauna { get; set; }

        [Column("transport")]
        [MaxLength(500)]
        public string Transport { get; set; } = string.Empty;

        [Column("education")]
        [MaxLength(500)]
        public string Education { get; set; } = string.Empty;

        [Column("shops")]
        [MaxLength(500)]
        public string Shops { get; set; } = string.Empty;

        // Навигационное свойство
        public House House { get; set; } = null!;
    }
}