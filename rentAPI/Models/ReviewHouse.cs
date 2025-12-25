using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Reviews_houses")]
    public class ReviewHouse
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("id_user")]
        public int IdUser { get; set; }

        [Required]
        [Column("rating")]
        [Range(1, 5)]
        public int Rating { get; set; }

        [Required]
        [Column("text")]
        [MaxLength(1000)]
        public string Text { get; set; } = string.Empty;

        [Required]
        [Column("id_houses")]
        public int IdHouses { get; set; }

        [Required]
        [Column("data_reviews")]
        public DateOnly DataReviews { get; set; }

        // Навигационные свойства
        public User User { get; set; } = null!;
        public House House { get; set; } = null!;
    }
}