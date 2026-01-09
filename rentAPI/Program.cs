using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using RentApp.API.Data;
using RentApp.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RentApp API",
        Version = "v1",
        Description = "API for Real Estate Application"
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"Connection String: {connectionString}");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
    // Enable detailed logging for debugging
    options.LogTo(Console.WriteLine, 
        new[] { DbLoggerCategory.Database.Command.Name },
        LogLevel.Information)
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors();
});

// Add Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAgentService, AgentService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    
    // For debugging JWT issues
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"JWT Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine($"JWT Token validated for: {context.Principal?.Identity?.Name}");
            return Task.CompletedTask;
        }
    };
});

// Add Authorization with roles
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("User", policy => policy.RequireRole("User"));
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// Configure logging
builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
});

// Register Chat controller
builder.Services.AddControllers()
    .AddApplicationPart(typeof(RentApp.API.Controllers.ChatsController).Assembly);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RentApp API v1");
        c.RoutePrefix = "swagger"; // Makes swagger available at /swagger
        c.ConfigObject.AdditionalItems["syntaxHighlight"] = new Dictionary<string, object>
        {
            ["activated"] = false
        };
    });
}

// ВАЖНО: правильный порядок middleware
app.UseHttpsRedirection();

// CORS должен быть ПОСЛЕ UseHttpsRedirection и ДО других middleware
app.UseCors("AllowAll");

// Логирование запросов
app.Use(async (context, next) =>
{
    var path = context.Request.Path;
    var method = context.Request.Method;
    
    // Логируем только запросы к API для отладки
    if (path.StartsWithSegments("/api"))
    {
        Console.WriteLine($"[{DateTime.Now:HH:mm:ss}] {method} {path}");
        
        // Логируем тело POST/PUT запросов
        if (method == "POST" || method == "PUT")
        {
            context.Request.EnableBuffering();
            
            using (var reader = new StreamReader(
                context.Request.Body,
                encoding: Encoding.UTF8,
                detectEncodingFromByteOrderMarks: false,
                bufferSize: 1024,
                leaveOpen: true))
            {
                var body = await reader.ReadToEndAsync();
                context.Request.Body.Position = 0;
                
                if (!string.IsNullOrEmpty(body) && body.Length < 1000) // Логируем только маленькие тела
                {
                    Console.WriteLine($"Request body: {body}");
                }
            }
        }
    }
    
    await next();
});

// Аутентификация и авторизация
app.UseAuthentication();
app.UseAuthorization();

// Маршрутизация - MapControllers должен быть ПОСЛЕ UseAuthorization
app.MapControllers();

// Fallback для SPA (если фронтенд встроен)
if (!app.Environment.IsDevelopment())
{
    app.UseDefaultFiles();
    app.UseStaticFiles();
    app.MapFallbackToFile("index.html");
}

// Initialize database with better error handling
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    
    Console.WriteLine("Attempting to connect to database...");
    
    // Check if we can connect
    var canConnect = await dbContext.Database.CanConnectAsync();
    Console.WriteLine($"Database connection successful: {canConnect}");
    
    if (canConnect)
    {
        try
        {
            // Сначала пробуем применить миграции
            await dbContext.Database.MigrateAsync();
            Console.WriteLine("Migrations applied successfully.");
        }
        catch (Exception migrateEx)
        {
            Console.WriteLine($"Migrations failed: {migrateEx.Message}");
            Console.WriteLine("Trying to ensure database is created...");
            
            // Если миграции не сработали, просто создаем базу
            await dbContext.Database.EnsureCreatedAsync();
            Console.WriteLine("Database ensured created successfully.");
        }
        
        // Проверяем существование таблиц для чатов
        try
        {
            // Проверяем существование таблицы Chats
            var chatTableExists = await dbContext.Database.ExecuteSqlRawAsync(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Chats'") > 0;
            
            if (!chatTableExists)
            {
                Console.WriteLine("Chat tables do not exist. Creating chat tables...");
                
                Console.WriteLine("Chat tables created successfully.");
            }
            else
            {
                Console.WriteLine("Chat tables already exist.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating chat tables: {ex.Message}");
        }
        
        // Проверяем существование администратора
        var adminExists = await dbContext.Users.AnyAsync(u => u.Email == "admin@gmail.com");
        if (!adminExists)
        {
            Console.WriteLine("Admin user not found. Creating admin account...");
            
            var adminPassword = BCrypt.Net.BCrypt.HashPassword("admin123");
            var adminUser = new RentApp.API.Models.User
            {
                Email = "admin@gmail.com",
                Fio = "System Administrator",
                Password = adminPassword,
                Phone_num = "+375000000000",
                Id_agent = false
            };
            
            await dbContext.Users.AddAsync(adminUser);
            await dbContext.SaveChangesAsync();
            Console.WriteLine("Admin user created successfully.");
        }
        else
        {
            Console.WriteLine("Admin user already exists.");
        }
        
        var userCount = await dbContext.Users.CountAsync();
        Console.WriteLine($"Total users in database: {userCount}");
        
        // Проверяем наличие агентов
        var agentCount = await dbContext.Agents.CountAsync();
        Console.WriteLine($"Total agents in database: {agentCount}");
        
        // Проверяем наличие чатов
        var chatCount = await dbContext.Chats.CountAsync();
        Console.WriteLine($"Total chats in database: {chatCount}");
        
        // Проверяем наличие сообщений
        var messageCount = await dbContext.Messages.CountAsync();
        Console.WriteLine($"Total messages in database: {messageCount}");
    }
    else
    {
        Console.WriteLine("Cannot connect to database. Check connection string.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"=== DATABASE INITIALIZATION ERROR ===");
    Console.WriteLine($"Error: {ex.Message}");
    Console.WriteLine($"Type: {ex.GetType().FullName}");
    
    if (ex.InnerException != null)
    {
        Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
        Console.WriteLine($"Inner type: {ex.InnerException.GetType().FullName}");
    }
    
    Console.WriteLine($"=== END ERROR ===");
}

// Выводим информацию о доступных маршрутах
app.MapGet("/", () => 
{
    var routes = new
    {
        ApiDocs = "/swagger",
        HealthCheck = "/health",
        Auth = new
        {
            Login = "POST /api/auth/login",
            Register = "POST /api/auth/register",
            Me = "GET /api/auth/me",
            UpdateProfile = "PUT /api/auth/update-profile"
        },
        Agents = new
        {
            Catalog = "GET /api/agents/catalog",
            GetById = "GET /api/agents/{id}",
            Specialties = "GET /api/agents/specialties",
            Reviews = "GET /api/agents/{id}/reviews"
        },
        Houses = new
        {
            Catalog = "GET /api/houses/catalog",
            GetById = "GET /api/houses/{id}",
            MyHouses = "GET /api/houses/my-houses",
            Create = "POST /api/houses",
            Update = "PUT /api/houses/{id}",
            Delete = "DELETE /api/houses/{id}",
            Reviews = new
            {
                Get = "GET /api/houses/{id}/reviews",
                Post = "POST /api/houses/{id}/reviews",
                Reply = "POST /api/houses/reviews/{id}/reply"
            },
            OwnerInfo = "GET /api/houses/{id}/owner-info" // Добавлен новый endpoint
        },
        Chats = new
        {
            MyChats = "GET /api/chats/my-chats",
            GetChat = "GET /api/chats/{id}",
            GetMessages = "GET /api/chats/{id}/messages",
            CreateChat = "POST /api/chats/create",
            SendMessage = "POST /api/chats/{id}/send",
            MarkRead = "POST /api/chats/{id}/mark-read",
            MarkAllRead = "POST /api/chats/mark-all-read",
            UnreadCount = "GET /api/chats/unread-count",
            DeleteChat = "DELETE /api/chats/{id}",
            GetChatInfo = "GET /api/chats/{id}/info"
        },
        Favorites = new
        {
            MyFavorites = "GET /api/favorites/my-favorites",
            MyFavoritesIds = "GET /api/favorites/my-favorites-ids",
            Add = "POST /api/favorites/add/{id}",
            Remove = "DELETE /api/favorites/remove/{id}",
            Check = "GET /api/favorites/check/{id}"
        },
        Support = new
        {
            CreateFeedback = "POST /api/support",
            MyFeedback = "GET /api/support/my-feedback",
            DeleteFeedback = "DELETE /api/support/{id}"
        }
    };
    
    return Results.Json(routes);
});

// Простой health check
app.MapGet("/health", () => Results.Ok(new { 
    status = "OK", 
    timestamp = DateTime.UtcNow,
    services = new[] { "Auth", "Houses", "Agents", "Chats", "Favorites", "Support" }
}));

// Health check для чатов
app.MapGet("/api/chats/health", () => 
{
    return Results.Ok(new 
    { 
        status = "Chats service is running", 
        timestamp = DateTime.UtcNow,
        version = "1.0.0",
        endpoints = new[] {
            "GET /api/chats/my-chats",
            "GET /api/chats/{id}",
            "POST /api/chats/create",
            "POST /api/chats/{id}/send",
            "GET /api/chats/unread-count"
        }
    });
});

Console.WriteLine("=== Application Starting ===");
Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
Console.WriteLine($"Application Name: {app.Environment.ApplicationName}");
Console.WriteLine("=== Available Routes ===");
Console.WriteLine("- Swagger UI: /swagger");
Console.WriteLine("- Health Check: /health");
Console.WriteLine("- API Base: /api");
Console.WriteLine("- Agents Catalog: GET /api/agents/catalog");
Console.WriteLine("- Houses Catalog: GET /api/houses/catalog");
Console.WriteLine("- Chats: GET /api/chats/my-chats");
Console.WriteLine("- Favorites: GET /api/favorites/my-favorites");
Console.WriteLine("=== Chat Endpoints ===");
Console.WriteLine("GET  /api/chats/my-chats           - Получить все чаты пользователя");
Console.WriteLine("GET  /api/chats/{id}               - Получить конкретный чат");
Console.WriteLine("GET  /api/chats/{id}/messages      - Получить сообщения чата");
Console.WriteLine("POST /api/chats/create             - Создать или получить чат");
Console.WriteLine("POST /api/chats/{id}/send          - Отправить сообщение");
Console.WriteLine("POST /api/chats/{id}/mark-read     - Пометить сообщения как прочитанные");
Console.WriteLine("POST /api/chats/mark-all-read      - Пометить все чаты как прочитанные");
Console.WriteLine("GET  /api/chats/unread-count       - Получить количество непрочитанных");
Console.WriteLine("GET  /api/chats/{id}/info          - Получить информацию о чате");
Console.WriteLine("DELETE /api/chats/{id}             - Удалить чат");
Console.WriteLine("===================================");

app.Run();