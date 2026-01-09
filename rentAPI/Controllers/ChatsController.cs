using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentApp.API.Models;
using System.Security.Claims;
using RentApp.API.Data;

namespace RentApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ChatsController> _logger;

        public ChatsController(AppDbContext context, ILogger<ChatsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("my-chats")]
        public async Task<IActionResult> GetMyChats()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized(new { success = false, message = "Пользователь не авторизован" });

                _logger.LogInformation($"Получение чатов для пользователя {userId}");

                var chats = await _context.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .Include(c => c.House)
                    .Include(c => c.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Take(1))
                    .Where(c => c.User1Id == userId || c.User2Id == userId)
                    .OrderByDescending(c => c.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .FirstOrDefault()
                        .CreatedAt)
                    .ToListAsync();

                var chatDtos = new List<object>();

                foreach (var chat in chats)
                {
                    try
                    {
                        var lastMessage = chat.Messages.FirstOrDefault();
                        var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;
                        
                        var unreadCount = await _context.Messages
                            .CountAsync(m => m.ChatId == chat.Id && 
                                            !m.IsRead && 
                                            m.SenderId != userId);

                        var houseInfo = await _context.HousesInfo
                            .FirstOrDefaultAsync(h => h.IdHouse == chat.HouseId);

                        var chatDto = new
                        {
                            id = chat.Id,
                            user_id = otherUser?.Id ?? 0,
                            user_name = otherUser?.Fio ?? "Неизвестный пользователь",
                            user_avatar = "",
                            ad_id = chat.HouseId,
                            ad_title = $"{chat.House?.HouseType ?? "Дом"}, {chat.House?.Area ?? 0} м²",
                            ad_address = houseInfo != null ? 
                                $"{houseInfo.City}, {houseInfo.Street}" : 
                                "Адрес не указан",
                            last_message = lastMessage?.Text ?? "Чат создан",
                            last_message_time = lastMessage?.CreatedAt ?? chat.CreatedAt,
                            unread_count = unreadCount,
                            created_at = chat.CreatedAt,
                            house_price = chat.House?.Price ?? 0,
                            house_photo = await _context.PhotoHouses
                                .Where(p => p.IdHouse == chat.HouseId)
                                .Select(p => p.Photo)
                                .FirstOrDefaultAsync()
                        };

                        chatDtos.Add(chatDto);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Ошибка при обработке чата {chat.Id}");
                        continue;
                    }
                }

                return Ok(new { 
                    success = true, 
                    data = chatDtos,
                    total = chatDtos.Count
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении чатов");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера",
                    detailed = ex.Message
                });
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

                _logger.LogInformation($"Получение чата {chatId} для пользователя {userId}");

                var chat = await _context.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .Include(c => c.House)
                    .ThenInclude(h => h.HouseInfo)
                    .Include(c => c.Messages
                        .OrderBy(m => m.CreatedAt)
                        .Take(100))
                    .ThenInclude(m => m.Sender)
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                                             (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Чат не найден или у вас нет доступа" 
                    });

                var unreadMessages = chat.Messages
                    .Where(m => !m.IsRead && m.SenderId != userId)
                    .ToList();

                if (unreadMessages.Any())
                {
                    foreach (var message in unreadMessages)
                    {
                        message.IsRead = true;
                    }
                    
                    try
                    {
                        await _context.SaveChangesAsync();
                        _logger.LogInformation($"Помечено как прочитано: {unreadMessages.Count} сообщений в чате {chatId}");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Ошибка при обновлении статуса сообщений");
                    }
                }

                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;
                var houseInfo = chat.House.HouseInfo;

                var response = new
                {
                    success = true,
                    data = new
                    {
                        id = chat.Id,
                        other_user = otherUser != null ? new
                        {
                            id = otherUser.Id,
                            name = otherUser.Fio,
                            email = otherUser.Email,
                            phone = otherUser.Phone_num,
                            is_agent = otherUser.Id_agent
                        } : null,
                        house = new
                        {
                            id = chat.House.Id,
                            title = chat.House.HouseType,
                            price = chat.House.Price,
                            area = chat.House.Area,
                            address = houseInfo != null ? 
                                $"{houseInfo.City}, {houseInfo.Street}" : 
                                "Адрес не указан",
                            city = houseInfo?.City,
                            street = houseInfo?.Street,
                            rooms = houseInfo?.Rooms,
                            main_photo = await _context.PhotoHouses
                                .Where(p => p.IdHouse == chat.House.Id)
                                .Select(p => p.Photo)
                                .FirstOrDefaultAsync()
                        },
                        messages = chat.Messages.Select(m => new
                        {
                            id = m.Id,
                            text = m.Text,
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
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера",
                    detailed = ex.Message
                });
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
                    .AnyAsync(c => c.Id == chatId && 
                                  (c.User1Id == userId || c.User2Id == userId));

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
                        sender_id = m.SenderId,
                        sender_name = m.Sender.Fio,
                        is_own = m.SenderId == userId,
                        is_read = m.IsRead,
                        created_at = m.CreatedAt,
                        time = m.CreatedAt.ToString("HH:mm"),
                        date = m.CreatedAt.ToString("yyyy-MM-dd")
                    })
                    .OrderBy(m => m.created_at)
                    .ToListAsync();

                var totalMessages = await _context.Messages
                    .CountAsync(m => m.ChatId == chatId);

                return Ok(new
                {
                    success = true,
                    data = messages,
                    pagination = new
                    {
                        skip = skip,
                        take = take,
                        total = totalMessages,
                        has_more = (skip + take) < totalMessages
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении сообщений чата {chatId}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Внутренняя ошибка сервера"
                });
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

                _logger.LogInformation($"Создание чата: User={userId}, OtherUser={request.OtherUserId}, House={request.HouseId}");

                if (userId == request.OtherUserId)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Нельзя создать чат с самим собой" 
                    });
                }

                var currentUser = await _context.Users.FindAsync(userId);
                var otherUser = await _context.Users.FindAsync(request.OtherUserId);
                
                if (currentUser == null || otherUser == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Пользователь не найден" 
                    });

                // Проверяем, не является ли текущий пользователь администратором
                if (currentUser.Email?.ToLower() == "admin@gmail.com")
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Администратор не может инициировать новые чаты" 
                    });
                }

                // Проверяем, не является ли другой пользователь администратором
                if (otherUser.Email?.ToLower() == "admin@gmail.com")
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Вы не можете написать администратору" 
                    });
                }

                var house = await _context.Houses
                    .Include(h => h.Owner)
                    .FirstOrDefaultAsync(h => h.Id == request.HouseId);

                if (house == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Объявление не найден" 
                    });

                if (house.IdOwner == userId)
                {
                    return BadRequest(new { 
                        success = false, 
                        message = "Вы не можете создать чат по своему объявлению" 
                    });
                }

                var user1Id = Math.Min(userId, request.OtherUserId);
                var user2Id = Math.Max(userId, request.OtherUserId);

                var existingChat = await _context.Chats
                    .FirstOrDefaultAsync(c => c.User1Id == user1Id && 
                                             c.User2Id == user2Id && 
                                             c.HouseId == request.HouseId);

                if (existingChat != null)
                {
                    _logger.LogInformation($"Найден существующий чат: {existingChat.Id}");
                    return Ok(new { 
                        success = true, 
                        data = new { 
                            chat_id = existingChat.Id,
                            is_new = false
                        } 
                    });
                }

                var chat = new Chat
                {
                    User1Id = user1Id,
                    User2Id = user2Id,
                    HouseId = request.HouseId,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Chats.AddAsync(chat);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Создан новый чат: {chat.Id}");

                var welcomeMessage = new Message
                {
                    ChatId = chat.Id,
                    SenderId = userId,
                    Text = request.InitialMessage ?? "Здравствуйте! Меня интересует ваше объявление.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Messages.AddAsync(welcomeMessage);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    success = true, 
                    data = new { 
                        chat_id = chat.Id,
                        is_new = true,
                        welcome_message_id = welcomeMessage.Id
                    } 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании чата");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Не удалось создать чат",
                    detailed = ex.Message
                });
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

                if (string.IsNullOrWhiteSpace(request.Text))
                    return BadRequest(new { 
                        success = false, 
                        message = "Сообщение не может быть пустым" 
                    });

                if (request.Text.Length > 2000)
                    return BadRequest(new { 
                        success = false, 
                        message = "Сообщение слишком длинное (максимум 2000 символов)" 
                    });

                var chat = await _context.Chats
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                                             (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Чат не найден или у вас нет доступа" 
                    });

                var currentUser = await _context.Users.FindAsync(userId);
                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;

                // Проверяем, не является ли текущий пользователь администратором
                if (currentUser?.Email?.ToLower() == "admin@gmail.com")
                {
                    // Администратор может отвечать только если:
                    // 1. Это ответ в существующем диалоге
                    // 2. Другой пользователь не администратор
                    if (otherUser?.Email?.ToLower() == "admin@gmail.com")
                    {
                        return BadRequest(new { 
                            success = false, 
                            message = "Администратор не может писать самому себе" 
                        });
                    }
                }
                else
                {
                    // Обычный пользователь не может писать администратору
                    if (otherUser?.Email?.ToLower() == "admin@gmail.com")
                    {
                        return BadRequest(new { 
                            success = false, 
                            message = "Вы не можете написать администратору" 
                        });
                    }
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

                _logger.LogInformation($"Отправлено сообщение: Chat={chatId}, Sender={userId}, Length={request.Text.Length}");

                return Ok(new { 
                    success = true, 
                    data = new { 
                        message_id = message.Id,
                        created_at = message.CreatedAt
                    } 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при отправке сообщения в чат {chatId}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Не удалось отправить сообщение",
                    detailed = ex.Message
                });
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
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                                             (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Чат не найден" 
                    });

                var unreadMessages = await _context.Messages
                    .Where(m => m.ChatId == chatId && 
                               !m.IsRead && 
                               m.SenderId != userId)
                    .ToListAsync();

                if (unreadMessages.Any())
                {
                    foreach (var message in unreadMessages)
                    {
                        message.IsRead = true;
                    }

                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation($"Помечено как прочитано: {unreadMessages.Count} сообщений в чате {chatId}");
                }

                return Ok(new { 
                    success = true, 
                    data = new { 
                        marked_count = unreadMessages.Count 
                    } 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при пометке сообщений как прочитанных в чате {chatId}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Не удалось обновить статус сообщений"
                });
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

                var unreadMessages = await _context.Messages
                    .Include(m => m.Chat)
                    .Where(m => !m.IsRead && 
                               m.SenderId != userId && 
                               (m.Chat.User1Id == userId || m.Chat.User2Id == userId))
                    .ToListAsync();

                if (unreadMessages.Any())
                {
                    foreach (var message in unreadMessages)
                    {
                        message.IsRead = true;
                    }

                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation($"Помечено как прочитано: {unreadMessages.Count} сообщений для пользователя {userId}");
                }

                return Ok(new { 
                    success = true, 
                    data = new { 
                        marked_count = unreadMessages.Count 
                    } 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при пометке всех чатов как прочитанных");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Не удалось обновить статус сообщений"
                });
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
                    .CountAsync(m => !m.IsRead && 
                                    m.SenderId != userId && 
                                    (m.Chat.User1Id == userId || m.Chat.User2Id == userId));

                return Ok(new { 
                    success = true, 
                    data = new { 
                        count = count 
                    } 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении количества непрочитанных сообщений");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Не удалось получить количество сообщений"
                });
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
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                                             (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Чат не найден или у вас нет доступа" 
                    });

                _context.Chats.Remove(chat);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Удален чат: {chatId} пользователем {userId}");

                return Ok(new { 
                    success = true, 
                    message = "Чат успешно удален" 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при удалении чата {chatId}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Не удалось удалить чат"
                });
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
                    .Include(c => c.User1)
                    .Include(c => c.User2)
                    .Include(c => c.House)
                    .ThenInclude(h => h.HouseInfo)
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                                             (c.User1Id == userId || c.User2Id == userId));

                if (chat == null)
                    return NotFound(new { 
                        success = false, 
                        message = "Чат не найден" 
                    });

                var otherUser = chat.User1Id == userId ? chat.User2 : chat.User1;
                var houseInfo = chat.House.HouseInfo;
                var mainPhoto = await _context.PhotoHouses
                    .Where(p => p.IdHouse == chat.House.Id)
                    .Select(p => p.Photo)
                    .FirstOrDefaultAsync();

                var unreadCount = await _context.Messages
                    .CountAsync(m => m.ChatId == chatId && 
                                    !m.IsRead && 
                                    m.SenderId != userId);

                var lastMessage = await _context.Messages
                    .Where(m => m.ChatId == chatId)
                    .OrderByDescending(m => m.CreatedAt)
                    .Select(m => new
                    {
                        text = m.Text,
                        created_at = m.CreatedAt,
                        sender_id = m.SenderId,
                        is_own = m.SenderId == userId
                    })
                    .FirstOrDefaultAsync();

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        id = chat.Id,
                        other_user = otherUser != null ? new
                        {
                            id = otherUser.Id,
                            name = otherUser.Fio,
                            email = otherUser.Email,
                            phone = otherUser.Phone_num,
                            is_agent = otherUser.Id_agent
                        } : null,
                        house = new
                        {
                            id = chat.House.Id,
                            title = chat.House.HouseType,
                            price = chat.House.Price,
                            area = chat.House.Area,
                            address = houseInfo != null ? 
                                $"{houseInfo.City}, {houseInfo.Street}" : 
                                "Адрес не указан",
                            city = houseInfo?.City,
                            street = houseInfo?.Street,
                            rooms = houseInfo?.Rooms,
                            main_photo = mainPhoto
                        },
                        last_message = lastMessage,
                        unread_count = unreadCount,
                        created_at = chat.CreatedAt,
                        total_messages = await _context.Messages
                            .CountAsync(m => m.ChatId == chatId)
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ошибка при получении информации о чате {chatId}");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Не удалось получить информацию о чате"
                });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return 0;
            }
            return userId;
        }
    }

    public class CreateChatRequest
    {
        public int OtherUserId { get; set; }
        public int HouseId { get; set; }
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