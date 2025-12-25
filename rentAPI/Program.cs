using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using RentApp.API.Data;
using RentApp.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

// Add Authentication Service
builder.Services.AddScoped<IAuthService, AuthService>();

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

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Отключаем HTTPS редирект в разработке
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

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
        
        // Seed initial data if needed
        if (!await dbContext.Users.AnyAsync())
        {
            Console.WriteLine("No users found, database is empty.");
        }
        else
        {
            var userCount = await dbContext.Users.CountAsync();
            Console.WriteLine($"Found {userCount} users in database.");
        }
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
    
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    Console.WriteLine($"=== END ERROR ===");
}

app.Run();