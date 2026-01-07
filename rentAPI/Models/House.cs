using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Houses")]
    public class House
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("price")]
        public decimal Price { get; set; }

        [Required]
        [Column("area")]
        public decimal Area { get; set; }

        [Required]
        [Column("id_owner")]
        public int IdOwner { get; set; }

        [Column("description")]
        [MaxLength(2000)]
        public string Description { get; set; } = string.Empty;

        [Column("active")]
        public bool Active { get; set; } = true;

        [Required]
        [Column("announcement_data")]
        public DateOnly AnnouncementData { get; set; }

        [Column("house_type")]
        [MaxLength(50)]
        public string HouseType { get; set; } = "Коттедж";

        [Column("rating")]
        [Range(0, 5)]
        public double Rating { get; set; } = 0; // Новое поле

        // Навигационные свойства
        public User Owner { get; set; } = null!;
        public HouseInfo HouseInfo { get; set; } = null!;
        public ICollection<PhotoHouse> Photos { get; set; } = new List<PhotoHouse>();
        public ICollection<ReviewHouse> Reviews { get; set; } = new List<ReviewHouse>();
        public Convenience Convenience { get; set; } = null!;
    }
}