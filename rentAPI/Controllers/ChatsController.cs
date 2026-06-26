using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Models;
using System.Security.Claims;
using RentApp.API.Data;
using RentApp.API.Services;
using RentApp.API.DTOs;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ChatsController> _logger;
        private readonly ICloudinaryService _cloudinaryService;

        public ChatsController(AppDbContext context, ILogger<ChatsController> logger, ICloudinaryService cloudinaryService)
        {
            _context = context;
            _logger = logger;
            _cloudinaryService = cloudinaryService;
        }

        [HttpGet("my-chats")]
        public async Task<IActionResult> GetMyChats()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var chats = await _context.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .Include(c => c.House)
                    .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                    .Where(c => c.User1Id == userId || c.User2Id == userId)
                    .OrderByDescending(c => c.Messages.FirstOrDefault()!.CreatedAt)
                    .ToListAsync();

                var chatDtos = new List<object>();
                foreach (var chat in chats)
                {
                    try
                    {
                        var lastMessage = chat.Messages.FirstOrDefault();
                        var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;
                        var unreadCount = await _context.Messages
                            .CountAsync(m => m.ChatId == chat.Id && !m.IsRead && m.SenderId != userId);

                        string adTitle = "Чат";
                        string adAddress = "";
                        int housePrice = 0;
                        string housePhoto = "";

                        if (chat.HouseId.HasValue && chat.House != null)
                        {
                            var houseInfo = await _context.HousesInfo
                                .FirstOrDefaultAsync(h => h.IdHouse == chat.HouseId);
                            adTitle = $"{chat.House.HouseType ?? "Дом"}, {chat.House.Area} м²";
                            adAddress = houseInfo != null
                                ? $"{houseInfo.City}, {houseInfo.Street}"
                                : "Адрес не указан";
                            housePrice = (int)chat.House.Price;
                            housePhoto = await _context.PhotoHouses
                                .Where(p => p.IdHouse == chat.HouseId)
                                .Select(p => p.Photo)
                                .FirstOrDefaultAsync() ?? "";
                        }
                        else if (otherUser != null)
                        {
                            var cateringOwner = await _context.CateringOwners
                                .FirstOrDefaultAsync(co => co.UserId == otherUser.Id && co.IsActive);
                            if (cateringOwner != null)
                            {
                                adTitle = cateringOwner.CompanyName;
                                adAddress = "Кейтеринг";
                            }
                            else if (otherUser.Id_agent)
                            {
                                adTitle = "Организатор праздников";
                                adAddress = "Консультация";
                            }
                            else
                            {
                                adTitle = "Чат без объявления";
                                adAddress = "";
                            }
                        }

                        chatDtos.Add(new
                        {
                            id = chat.Id,
                            user_id = otherUser?.Id ?? 0,
                            user_name = otherUser?.Fio ?? "Неизвестный пользователь",
                            user_avatar = "",
                            ad_id = chat.HouseId ?? 0,
                            ad_title = adTitle,
                            ad_address = adAddress,
                            last_message = lastMessage != null
                                ? (lastMessage.Text ?? "Изображение")
                                : "Чат создан",
                            last_message_time = lastMessage?.CreatedAt ?? chat.CreatedAt,
                            unread_count = unreadCount,
                            created_at = chat.CreatedAt,
                            house_price = housePrice,
                            house_photo = housePhoto
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Ошибка при обработке чата {chat.Id}");
                    }
                }

                return Ok(new { success = true, data = chatDtos, total = chatDtos.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении чатов");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateOrGetChat([FromBody] CreateChatRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });
                if (userId == request.OtherUserId)
                    return BadRequest(new { success = false, message = "Нельзя создать чат с самим собой" });

                var currentUser = await _context.Users.FindAsync(userId);
                var otherUser = await _context.Users.FindAsync(request.OtherUserId);
                if (currentUser == null || otherUser == null)
                    return NotFound(new { success = false, message = "Пользователь не найден" });

                if (currentUser.Email?.ToLower() == "admin@gmail.com")
                    return BadRequest(new { success = false, message = "Администратор не может инициировать новые чаты" });
                if (otherUser.Email?.ToLower() == "admin@gmail.com")
                    return BadRequest(new { success = false, message = "Вы не можете написать администратору" });

                var house = await _context.Houses
                    .Include(h => h.Owner)
                    .FirstOrDefaultAsync(h => h.Id == request.HouseId);
                if (house == null)
                    return NotFound(new { success = false, message = "Объявление не найдено" });
                if (house.IdOwner == userId)
                    return BadRequest(new { success = false, message = "Вы не можете создать чат по своему объявлению" });

                var u1 = Math.Min(userId, request.OtherUserId);
                var u2 = Math.Max(userId, request.OtherUserId);
                var existing = await _context.Chats
                    .FirstOrDefaultAsync(c => c.User1Id == u1 && c.User2Id == u2 && c.HouseId == request.HouseId);
                if (existing != null)
                    return Ok(new { success = true, data = new { chat_id = existing.Id, is_new = false } });

                var chat = new Chat
                {
                    User1Id = u1,
                    User2Id = u2,
                    HouseId = request.HouseId,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Chats.AddAsync(chat);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, data = new { chat_id = chat.Id, is_new = true } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании чата");
                return StatusCode(500, new { success = false, message = "Не удалось создать чат" });
            }
        }

        [HttpPost("create-with-agent")]
        public async Task<IActionResult> CreateChatWithAgent([FromBody] CreateChatWithAgentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });
                if (userId == request.AgentId)
                    return BadRequest(new { success = false, message = "Нельзя создать чат с самим собой" });

                var currentUser = await _context.Users.FindAsync(userId);
                var agentUser = await _context.Users
                    .Include(u => u.AgentInfo)
                    .FirstOrDefaultAsync(u => u.Id == request.AgentId);
                if (currentUser == null || agentUser == null)
                    return NotFound(new { success = false, message = "Пользователь не найден" });

                if (!agentUser.Id_agent)
                    return BadRequest(new { success = false, message = "Указанный пользователь не является агентом" });
                if (currentUser.Email?.ToLower() == "admin@gmail.com")
                    return BadRequest(new { success = false, message = "Администратор не может инициировать новые чаты" });
                if (agentUser.Email?.ToLower() == "admin@gmail.com")
                    return BadRequest(new { success = false, message = "Вы не можете написать администратору" });

                var u1 = Math.Min(userId, request.AgentId);
                var u2 = Math.Max(userId, request.AgentId);
                var existing = await _context.Chats
                    .FirstOrDefaultAsync(c => c.User1Id == u1 && c.User2Id == u2 && !c.HouseId.HasValue);
                if (existing != null)
                    return Ok(new { success = true, data = new { chat_id = existing.Id, is_new = false } });

                var chat = new Chat
                {
                    User1Id = u1,
                    User2Id = u2,
                    HouseId = null,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Chats.AddAsync(chat);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, data = new { chat_id = chat.Id, is_new = true } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании чата с агентом");
                return StatusCode(500, new { success = false, message = "Не удалось создать чат" });
            }
        }

        [HttpGet("{chatId}")]
        public async Task<IActionResult> GetChat(int chatId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var chat = await _context.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .Include(c => c.House).ThenInclude(h => h.HouseInfo)
                    .Include(c => c.Messages.OrderBy(m => m.CreatedAt).Take(100))
                        .ThenInclude(m => m.Sender)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                    return NotFound(new { success = false, message = "Чат не найден" });

                var unread = chat.Messages
                    .Where(m => !m.IsRead && m.SenderId != userId)
                    .ToList();
                if (unread.Any())
                {
                    foreach (var m in unread) m.IsRead = true;
                    await _context.SaveChangesAsync();
                }

                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;

                string chatType = "house";
                decimal? agentPrice = null;
                string? agentSpecialization = null;
                string? cateringName = null;
                bool isCateringOwner = false;

                if (!chat.HouseId.HasValue && otherUser != null)
                {
                    var cateringOwner = await _context.CateringOwners
                        .FirstOrDefaultAsync(co => co.UserId == otherUser.Id && co.IsActive);

                    if (cateringOwner != null)
                    {
                        chatType = "catering";
                        cateringName = cateringOwner.CompanyName;
                        isCateringOwner = true;
                    }
                    else if (otherUser.Id_agent)
                    {
                        chatType = "agent";
                        var agentInfo = await _context.Agents
                            .FirstOrDefaultAsync(a => a.UserId == otherUser.Id);
                        if (agentInfo != null)
                        {
                            agentPrice = agentInfo.Price;
                            agentSpecialization = agentInfo.Specialization;
                        }
                    }
                }

                object houseInfoObj;
                if (chat.HouseId.HasValue && chat.House != null)
                {
                    var hi = chat.House.HouseInfo;
                    houseInfoObj = new
                    {
                        id = chat.House.Id,
                        title = chat.House.HouseType,
                        price = chat.House.Price,
                        area = chat.House.Area,
                        address = hi != null ? $"{hi.City}, {hi.Street}" : "Адрес не указан",
                        city = hi?.City,
                        street = hi?.Street,
                        rooms = hi?.Rooms,
                        main_photo = await _context.PhotoHouses
                            .Where(p => p.IdHouse == chat.House.Id)
                            .Select(p => p.Photo)
                            .FirstOrDefaultAsync()
                    };
                }
                else
                {
                    houseInfoObj = new { };
                }

                var otherUserResponse = otherUser != null
                    ? new
                    {
                        id = otherUser.Id,
                        name = otherUser.Fio,
                        email = otherUser.Email,
                        phone = otherUser.Phone_num,
                        is_agent = otherUser.Id_agent,
                        is_catering_owner = isCateringOwner
                    }
                    : null;

                var response = new
                {
                    success = true,
                    data = new
                    {
                        id = chat.Id,
                        chat_type = chatType,
                        agent_price = agentPrice,
                        agent_specialization = agentSpecialization,
                        catering_name = cateringName,
                        other_user = otherUserResponse,
                        house = houseInfoObj,
                        messages = chat.Messages.Select(m => new
                        {
                            id = m.Id,
                            text = m.Text,
                            image_url = m.ImageUrl,
                            sender_id = m.SenderId,
                            sender_name = m.Sender?.Fio ?? "Неизвестный",
                            is_own = m.SenderId == userId,
                            is_read = m.IsRead,
                            created_at = m.CreatedAt,
                            time = m.CreatedAt.ToString("HH:mm"),
                            date = m.CreatedAt.ToString("yyyy-MM-dd")
                        }).ToList(),
                        created_at = chat.CreatedAt,
                        total_messages = await _context.Messages
                            .CountAsync(m => m.ChatId == chatId),
                        can_load_more = chat.Messages.Count >= 100
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении чата {chatId}");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка" });
            }
        }

        [HttpGet("{chatId}/messages")]
        public async Task<IActionResult> GetMessages(int chatId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var hasAccess = await _context.Chats
                    .AnyAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));
                if (!hasAccess)
                    return NotFound(new { success = false, message = "Чат не найден" });

                var messages = await _context.Messages
                    .Include(m => m.Sender)
                    .Where(m => m.ChatId == chatId)
                    .OrderByDescending(m => m.CreatedAt)
                    .Skip(skip)
                    .Take(take)
                    .Select(m => new
                    {
                        id = m.Id,
                        text = m.Text,
                        image_url = m.ImageUrl,
                        sender_id = m.SenderId,
                        sender_name = m.Sender!.Fio,
                        is_own = m.SenderId == userId,
                        is_read = m.IsRead,
                        created_at = m.CreatedAt,
                        time = m.CreatedAt.ToString("HH:mm"),
                        date = m.CreatedAt.ToString("yyyy-MM-dd")
                    })
                    .OrderBy(m => m.created_at)
                    .ToListAsync();

                var total = await _context.Messages.CountAsync(m => m.ChatId == chatId);
                return Ok(new
                {
                    success = true,
                    data = messages,
                    pagination = new { skip, take, total, has_more = (skip + take) < total }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении сообщений чата {chatId}");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка" });
            }
        }

        [HttpPost("{chatId}/send")]
        public async Task<IActionResult> SendMessage(int chatId, [FromBody] SendMessageRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });
                if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > 2000)
                    return BadRequest(new { success = false, message = "Некорректное сообщение" });

                var chat = await _context.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));
                if (chat == null)
                    return NotFound(new { success = false, message = "Чат не найден" });

                var currentUser = await _context.Users.FindAsync(userId);
                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;

                if (currentUser?.Email?.ToLower() == "admin@gmail.com")
                {
                    if (otherUser?.Email?.ToLower() == "admin@gmail.com")
                        return BadRequest(new { success = false, message = "Администратор не может писать самому себе" });
                }
                else
                {
                    if (otherUser?.Email?.ToLower() == "admin@gmail.com")
                        return BadRequest(new { success = false, message = "Вы не можете написать администратору" });
                }

                var message = new Message
                {
                    ChatId = chatId,
                    SenderId = userId,
                    Text = request.Text.Trim(),
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Messages.AddAsync(message);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    data = new { message_id = message.Id, created_at = message.CreatedAt }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при отправке сообщения в чат {chatId}");
                return StatusCode(500, new { success = false, message = "Не удалось отправить" });
            }
        }

        [HttpDelete("{chatId}/messages/{messageId}")]
        public async Task<IActionResult> DeleteMessage(int chatId, int messageId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var message = await _context.Messages
                    .Include(m => m.Chat)
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.ChatId == chatId);
                if (message == null)
                    return NotFound(new { success = false, message = "Сообщение не найдено" });
                if (message.SenderId != userId)
                    return Forbid("Вы можете удалять только свои сообщения");

                var hasAccess = message.Chat.User1Id == userId || message.Chat.User2Id == userId;
                if (!hasAccess)
                    return Forbid("Нет доступа к чату");

                _context.Messages.Remove(message);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Сообщение удалено" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении сообщения");
                return StatusCode(500, new { success = false, message = "Не удалось удалить сообщение" });
            }
        }

        [HttpPost("{chatId}/upload-image")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<IActionResult> UploadImage(int chatId, IFormFile file, [FromForm] string? text)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "Файл не выбран" });

                var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var ext = Path.GetExtension(file.FileName).ToLower();
                if (!allowed.Contains(ext))
                    return BadRequest(new { success = false, message = "Разрешены только изображения" });

                var chat = await _context.Chats
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));
                if (chat == null)
                    return NotFound(new { success = false, message = "Чат не найден" });

                var uploadResult = await _cloudinaryService.UploadImageAsync(file);
                if (uploadResult == null)
                    return BadRequest(new { success = false, message = "Ошибка загрузки изображения" });

                var message = new Message
                {
                    ChatId = chatId,
                    SenderId = userId,
                    Text = string.IsNullOrWhiteSpace(text) ? "" : text.Trim(),
                    ImageUrl = uploadResult.Secure_url,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Messages.AddAsync(message);
                await _context.SaveChangesAsync();

                var sender = await _context.Users.FindAsync(userId);
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = message.Id,
                        text = message.Text,
                        image_url = message.ImageUrl,
                        sender_id = message.SenderId,
                        sender_name = sender?.Fio ?? "Вы",
                        is_own = true,
                        is_read = false,
                        created_at = message.CreatedAt,
                        time = message.CreatedAt.ToString("HH:mm"),
                        date = message.CreatedAt.ToString("yyyy-MM-dd")
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка загрузки изображения в чат {ChatId}", chatId);
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка" });
            }
        }

        [HttpPost("{chatId}/mark-read")]
        public async Task<IActionResult> MarkMessagesAsRead(int chatId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var chat = await _context.Chats
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));
                if (chat == null)
                    return NotFound(new { success = false, message = "Чат не найден" });

                var unread = await _context.Messages
                    .Where(m => m.ChatId == chatId && !m.IsRead && m.SenderId != userId)
                    .ToListAsync();
                if (unread.Any())
                {
                    foreach (var m in unread) m.IsRead = true;
                    await _context.SaveChangesAsync();
                }
                return Ok(new { success = true, data = new { marked_count = unread.Count } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при пометке сообщений как прочитанных");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка" });
            }
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllChatsAsRead()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var unread = await _context.Messages
                    .Include(m => m.Chat)
                    .Where(m => !m.IsRead && m.SenderId != userId
                        && (m.Chat.User1Id == userId || m.Chat.User2Id == userId))
                    .ToListAsync();
                if (unread.Any())
                {
                    foreach (var m in unread) m.IsRead = true;
                    await _context.SaveChangesAsync();
                }
                return Ok(new { success = true, data = new { marked_count = unread.Count } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при пометке всех чатов как прочитанных");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка" });
            }
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var count = await _context.Messages
                    .Include(m => m.Chat)
                    .CountAsync(m => !m.IsRead && m.SenderId != userId
                        && (m.Chat.User1Id == userId || m.Chat.User2Id == userId));
                return Ok(new { success = true, data = new { count } });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении количества непрочитанных сообщений");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка" });
            }
        }

        [HttpDelete("{chatId}")]
        public async Task<IActionResult> DeleteChat(int chatId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var chat = await _context.Chats
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));
                if (chat == null)
                    return NotFound(new { success = false, message = "Чат не найден" });

                _context.Chats.Remove(chat);
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Чат удалён" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении чата");
                return StatusCode(500, new { success = false, message = "Не удалось удалить чат" });
            }
        }

        [HttpGet("{chatId}/info")]
        public async Task<IActionResult> GetChatInfo(int chatId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                var chat = await _context.Chats
                    .Include(c => c.User1).Include(c => c.User2)
                    .Include(c => c.House).ThenInclude(h => h.HouseInfo)
                    .FirstOrDefaultAsync(c => c.Id == chatId && (c.User1Id == userId || c.User2Id == userId));
                if (chat == null)
                    return NotFound(new { success = false, message = "Чат не найден" });

                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;

                object? houseInfoObj = null;
                if (chat.HouseId.HasValue && chat.House != null)
                {
                    var hi = chat.House.HouseInfo;
                    houseInfoObj = new
                    {
                        id = chat.House.Id,
                        title = chat.House.HouseType,
                        price = chat.House.Price,
                        area = chat.House.Area,
                        address = hi != null ? $"{hi.City}, {hi.Street}" : "Адрес не указан",
                        city = hi?.City,
                        street = hi?.Street,
                        rooms = hi?.Rooms,
                        main_photo = await _context.PhotoHouses
                            .Where(p => p.IdHouse == chat.House.Id)
                            .Select(p => p.Photo)
                            .FirstOrDefaultAsync()
                    };
                }

                var unread = await _context.Messages
                    .CountAsync(m => m.ChatId == chatId && !m.IsRead && m.SenderId != userId);
                var lastMsg = await _context.Messages
                    .Where(m => m.ChatId == chatId)
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new
                    {
                        m.Text,
                        m.CreatedAt,
                        m.SenderId,
                        is_own = m.SenderId == userId
                    })
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = chat.Id,
                        other_user = otherUser != null
                            ? new
                            {
                                id = otherUser.Id,
                                name = otherUser.Fio,
                                email = otherUser.Email,
                                phone = otherUser.Phone_num,
                                is_agent = otherUser.Id_agent
                            }
                            : null,
                        house = houseInfoObj,
                        last_message = lastMsg,
                        unread_count = unread,
                        created_at = chat.CreatedAt,
                        total_messages = await _context.Messages.CountAsync(m => m.ChatId == chatId)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении информации о чате {chatId}");
                return StatusCode(500, new { success = false, message = "Внутренняя ошибка" });
            }
        }

        private int GetCurrentUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return int.TryParse(claim, out int id) ? id : 0;
        }
    }

    public class CreateChatRequest
    {
        public int OtherUserId { get; set; }
        public int HouseId { get; set; }
        public string? InitialMessage { get; set; }
    }

    public class CreateChatWithAgentRequest
    {
        public int AgentId { get; set; }
        public string? InitialMessage { get; set; }
    }

    public class SendMessageRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    public class UpdateMessageRequest
    {
        public string Text { get; set; } = string.Empty;
    }
}