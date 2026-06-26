using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("ServiceRequests")]
    public class ServiceRequest
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("user_id")]
        public int UserId { get; set; }

        [Required]
        [MaxLength(50)]
        [Column("service_type")]
        public string ServiceType { get; set; } = string.Empty; 

        [Required]
        [MaxLength(200)]
        [Column("company_name")]
        public string CompanyName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        [Column("city")]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        [Column("phone")]
        public string Phone { get; set; } = string.Empty;

        [MaxLength(20)]
        [Column("status")]
        public string Status { get; set; } = "pending"; 
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("UserId")]
        public virtual User? User { get; set; }
    }
}