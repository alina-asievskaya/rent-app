using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Photo_houses")]
    public class PhotoHouse
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("id_house")]
        public int IdHouse { get; set; }

        [Required]
        [Column("photo")]
        [MaxLength(500)]
        public string Photo { get; set; } = string.Empty; // URL или base64

        // Навигационное свойство
        public House House { get; set; } = null!;
    }
}