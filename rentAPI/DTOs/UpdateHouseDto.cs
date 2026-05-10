using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class UpdateHouseDto : CreateHouseDto
    {
        [Required]
        public bool DeleteExistingPhotos { get; set; } = true;
    }

    public class ToggleActiveDto
    {
        [Required]
        public bool Active { get; set; }
    }
}