using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("HouseCateringRequests")]
    public class HouseCateringRequest
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

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending, approved, rejected

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("responded_at")]
        public DateTime? RespondedAt { get; set; }
    
        [ForeignKey("HouseId")]
        public House House { get; set; } = null!;

        [ForeignKey("CateringOwnerId")]
        public CateringOwner CateringOwner { get; set; } = null!;
    }
}