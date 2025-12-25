using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentApp.API.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id_user")] // Соответствует SQL столбцу
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(50)] // Изменено с 100 на 50
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength] // MAX вместо конкретной длины
        [Column("fio")]
        public string Fio { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        [Column("password")]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Phone]
        [MaxLength(20)]
        [Column("phone_num")]
        public string Phone_num { get; set; } = string.Empty;

        [Required]
        [Column("id_agent")]
        public bool Id_agent { get; set; } = false;

        // Убрал CreatedAt, так как его нет в SQL таблице
    }
}