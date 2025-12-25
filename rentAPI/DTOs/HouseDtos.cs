using System.ComponentModel.DataAnnotations;

namespace RentApp.API.DTOs
{
    public class CreateHouseDto
    {
        [Required(ErrorMessage = "Цена обязательна")]
        [Range(1, 100000000, ErrorMessage = "Цена должна быть от 1 до 100,000,000")]
        public decimal Price { get; set; }

        [Required(ErrorMessage = "Площадь обязательна")]
        [Range(1, 10000, ErrorMessage = "Площадь должна быть от 1 до 10,000 м²")]
        public decimal Area { get; set; }

        [Required(ErrorMessage = "Описание обязательно")]
        [MinLength(50, ErrorMessage = "Описание должно содержать минимум 50 символов")]
        [MaxLength(2000, ErrorMessage = "Описание не должно превышать 2000 символов")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Тип дома обязателен")]
        public string HouseType { get; set; } = "Коттедж";

        // HouseInfo
        [Required(ErrorMessage = "Область обязательна")]
        [MaxLength(100)]
        public string Region { get; set; } = string.Empty;

        [Required(ErrorMessage = "Город обязателен")]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required(ErrorMessage = "Адрес обязателен")]
        [MaxLength(200)]
        public string Street { get; set; } = string.Empty;

        [Required(ErrorMessage = "Количество комнат обязательно")]
        [Range(1, 50, ErrorMessage = "Количество комнат должно быть от 1 до 50")]
        public int Rooms { get; set; }

        [Required(ErrorMessage = "Количество санузлов обязательно")]
        [Range(1, 20, ErrorMessage = "Количество санузлов должно быть от 1 до 20")]
        public int Bathrooms { get; set; }

        [Required(ErrorMessage = "Этаж обязателен")]
        [Range(0, 10, ErrorMessage = "Этаж должен быть от 0 до 10")]
        public int Floor { get; set; } = 1;

        // Convenience
        public bool Conditioner { get; set; }
        public bool Furniture { get; set; }
        public bool Internet { get; set; }
        public bool Security { get; set; }
        public bool VideoSurveillance { get; set; }
        public bool FireAlarm { get; set; }
        public bool Parking { get; set; }
        public bool Garage { get; set; }
        public bool Garden { get; set; }
        public bool SwimmingPool { get; set; }
        public bool Sauna { get; set; }

        [MaxLength(500)]
        public string Transport { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Education { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Shops { get; set; } = string.Empty;
        public List<string> PhotoUrls { get; set; } = new List<string>();
    }
}