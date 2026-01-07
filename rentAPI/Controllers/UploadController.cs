// Controllers/UploadController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        public UploadController(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { success = false, message = "Файл не выбран" });
                }

                // Проверяем тип файла
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
                {
                    return BadRequest(new { success = false, message = "Разрешены только файлы JPG, JPEG, PNG и GIF" });
                }

                // Проверяем размер файла (макс 5MB)
                if (file.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { success = false, message = "Размер файла не должен превышать 5MB" });
                }

                // Создаем уникальное имя файла
                var fileName = Guid.NewGuid().ToString() + extension;
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads", "agents");
                
                // Создаем папку, если она не существует
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Сохраняем файл
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Формируем URL для доступа к файлу
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var fileUrl = $"{baseUrl}/uploads/agents/{fileName}";

                return Ok(new { 
                    success = true, 
                    url = fileUrl,
                    fileName = fileName
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при загрузке изображения: {ex.Message}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера" 
                });
            }
        }

        [HttpDelete("image")]
        public async Task<IActionResult> DeleteImage([FromBody] DeleteImageDto dto)
        {
            try
            {
                if (string.IsNullOrEmpty(dto.FileName))
                {
                    return BadRequest(new { success = false, message = "Имя файла не указано" });
                }

                var filePath = Path.Combine(_environment.WebRootPath, "uploads", "agents", dto.FileName);
                
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    return Ok(new { success = true, message = "Изображение успешно удалено" });
                }
                else
                {
                    return NotFound(new { success = false, message = "Файл не найден" });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при удалении изображения: {ex.Message}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера" 
                });
            }
        }
    }

    public class DeleteImageDto
    {
        public string FileName { get; set; } = string.Empty;
    }
}