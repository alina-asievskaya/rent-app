using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Agents")]
    public class Agent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_agent")]
        public int Id { get; set; }

        [Required]
        [Column("id_user")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("specialization")]
        public string Specialization { get; set; } = string.Empty;

        [Required]
        [Column("experience")]
        public int Experience { get; set; } = 0;

        [MaxLength(500)]
        [Column("photo")]
        public string Photo { get; set; } = string.Empty;

        [Column("rating")]
        [Range(0, 5)]
        public double Rating { get; set; } = 0;

        [Column("reviews_count")]
        public int ReviewsCount { get; set; } = 0;

        // Навигационные свойства
        public User User { get; set; } = null!;
        public ICollection<AgentReview> Reviews { get; set; } = new List<AgentReview>();
    }
}