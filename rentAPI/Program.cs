using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using RentApp.API.Data;
using RentApp.API.Services;
using RentApp.API.DTOs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

// Исправлено: регистрация интерфейса, а не конкретного класса
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAgentService, AgentService>();

// Configure Swagger with JWT support
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RentApp API",
        Version = "v1",
        Description = "API for Real Estate Application"
    });

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
    options.LogTo(Console.WriteLine,
        new[] { DbLoggerCategory.Database.Command.Name },
        LogLevel.Information)
        .EnableSensitiveDataLogging()
        .EnableDetailedErrors();
});

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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy => policy.RequireRole("Admin"));
    options.AddPolicy("User", policy => policy.RequireRole("User"));
});

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

builder.Services.AddLogging(logging =>
{
    logging.AddConsole();
    logging.AddDebug();
});

builder.Services.AddControllers()
    .AddApplicationPart(typeof(RentApp.API.Controllers.ChatsController).Assembly);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RentApp API v1");
        c.RoutePrefix = "swagger";
        c.ConfigObject.AdditionalItems["syntaxHighlight"] = new Dictionary<string, object>
        {
            ["activated"] = false
        };
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

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
    var canConnect = await dbContext.Database.CanConnectAsync();
    Console.WriteLine($"Database connection successful: {canConnect}");
    
    if (canConnect)
    {
        try
        {
            await dbContext.Database.MigrateAsync();
            Console.WriteLine("Migrations applied successfully.");
        }
        catch (Exception migrateEx)
        {
            Console.WriteLine($"Migrations failed: {migrateEx.Message}");
            await dbContext.Database.EnsureCreatedAsync();
            Console.WriteLine("Database ensured created successfully.");
        }
        
        try
        {
            var chatTableExists = await dbContext.Database.ExecuteSqlRawAsync(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Chats'") > 0;
            if (!chatTableExists)
                Console.WriteLine("Chat tables do not exist.");
            else
                Console.WriteLine("Chat tables already exist.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error checking chat tables: {ex.Message}");
        }
        
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
        
        Console.WriteLine($"Total users in database: {await dbContext.Users.CountAsync()}");
        Console.WriteLine($"Total agents in database: {await dbContext.Agents.CountAsync()}");
        Console.WriteLine($"Total chats in database: {await dbContext.Chats.CountAsync()}");
        Console.WriteLine($"Total messages in database: {await dbContext.Messages.CountAsync()}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"=== DATABASE INITIALIZATION ERROR ===");
    Console.WriteLine($"Error: {ex.Message}");
}

app.MapGet("/", () => Results.Ok(new { ApiDocs = "/swagger", HealthCheck = "/health" }));
app.MapGet("/health", () => Results.Ok(new { status = "OK", timestamp = DateTime.UtcNow }));

app.Run();