using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("HouseCaterings")]
    public class HouseCatering
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("house_id")]
        public int HouseId { get; set; }

        [Required]
        [Column("catering_owner_id")]
        public int CateringOwnerId { get; set; }

        [ForeignKey("HouseId")]
        public House House { get; set; } = null!;

        [ForeignKey("CateringOwnerId")]
        public CateringOwner CateringOwner { get; set; } = null!;
    }
}