using Microsoft.EntityFrameworkCore;
using RentApp.API.Models;

namespace RentApp.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Feedback> Feedback { get; set; }
        public DbSet<House> Houses { get; set; }
        public DbSet<HouseInfo> HousesInfo { get; set; }
        public DbSet<PhotoHouse> PhotoHouses { get; set; }
        public DbSet<ReviewHouse> ReviewHouses { get; set; }
        public DbSet<Convenience> Conveniences { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Конфигурация Users
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users");
                entity.HasKey(u => u.Id);
                
                entity.Property(u => u.Id)
                    .HasColumnName("id_user")
                    .ValueGeneratedOnAdd();
                
                entity.Property(u => u.Email)
                    .HasColumnName("email")
                    .IsRequired()
                    .HasMaxLength(50);
                
                entity.Property(u => u.Fio)
                    .HasColumnName("fio")
                    .IsRequired();
                
                entity.Property(u => u.Password)
                    .HasColumnName("password")
                    .IsRequired()
                    .HasMaxLength(255);
                
                entity.Property(u => u.Phone_num)
                    .HasColumnName("phone_num")
                    .IsRequired()
                    .HasMaxLength(20);
                
                entity.Property(u => u.Id_agent)
                    .HasColumnName("id_agent")
                    .HasDefaultValue(false);

                // Уникальные индексы
                entity.HasIndex(u => u.Email).IsUnique();
                entity.HasIndex(u => u.Phone_num).IsUnique();
            });

            // Конфигурация Feedback
            modelBuilder.Entity<Feedback>(entity =>
            {
                entity.ToTable("Feedback");
                entity.HasKey(f => f.Id);
                
                entity.Property(f => f.Id)
                    .HasColumnName("id_feedback")
                    .ValueGeneratedOnAdd();
                
                entity.Property(f => f.UserId)
                    .HasColumnName("id_user")
                    .IsRequired();
                
                entity.Property(f => f.Topic)
                    .HasColumnName("topic")
                    .IsRequired()
                    .HasMaxLength(100);
                
                entity.Property(f => f.Text)
                    .HasColumnName("text")
                    .IsRequired()
                    .HasMaxLength(2000);
                
                entity.Property(f => f.CreatedAt)
                    .HasColumnName("created_at")
                    .HasDefaultValueSql("GETUTCDATE()");

                // Внешний ключ к Users
                entity.HasOne(f => f.User)
                    .WithMany()
                    .HasForeignKey(f => f.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Индексы
                entity.HasIndex(f => f.UserId);
                entity.HasIndex(f => f.CreatedAt);
            });

            // Конфигурация Houses
            modelBuilder.Entity<House>(entity =>
            {
                entity.ToTable("Houses");
                entity.HasKey(h => h.Id);
                
                entity.Property(h => h.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                entity.Property(h => h.Price)
                    .HasColumnName("price")
                    .IsRequired()
                    .HasColumnType("decimal(18,2)");
                
                entity.Property(h => h.Area)
                    .HasColumnName("area")
                    .IsRequired()
                    .HasColumnType("decimal(10,2)");
                
                entity.Property(h => h.IdOwner)
                    .HasColumnName("id_owner")
                    .IsRequired();
                
                entity.Property(h => h.Description)
                    .HasColumnName("description")
                    .HasMaxLength(2000);
                
                entity.Property(h => h.Active)
                    .HasColumnName("active")
                    .HasDefaultValue(true);
                
                entity.Property(h => h.AnnouncementData)
                    .HasColumnName("announcement_data")
                    .IsRequired()
                    .HasColumnType("date");
                
                entity.Property(h => h.HouseType)
                    .HasColumnName("house_type")
                    .HasMaxLength(50)
                    .HasDefaultValue("Коттедж");

                entity.HasOne(h => h.Owner)
                    .WithMany()
                    .HasForeignKey(h => h.IdOwner)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(h => h.IdOwner);
                entity.HasIndex(h => h.Active);
                entity.HasIndex(h => h.AnnouncementData);
                entity.HasIndex(h => h.HouseType);
            });

            // Конфигурация HousesInfo
            modelBuilder.Entity<HouseInfo>(entity =>
            {
                entity.ToTable("Houses_info");
                entity.HasKey(hi => hi.Id);
                
                entity.Property(hi => hi.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                entity.Property(hi => hi.IdHouse)
                    .HasColumnName("id_house")
                    .IsRequired();
                
                entity.Property(hi => hi.Region)
                    .HasColumnName("region")
                    .IsRequired()
                    .HasMaxLength(100);
                
                entity.Property(hi => hi.City)
                    .HasColumnName("city")
                    .IsRequired()
                    .HasMaxLength(100);
                
                entity.Property(hi => hi.Street)
                    .HasColumnName("street")
                    .IsRequired()
                    .HasMaxLength(200);
                
                entity.Property(hi => hi.Rooms)
                    .HasColumnName("rooms")
                    .IsRequired();
                
                entity.Property(hi => hi.Bathrooms)
                    .HasColumnName("bathrooms")
                    .IsRequired();
                
                entity.Property(hi => hi.Floor)
                    .HasColumnName("floor")
                    .IsRequired();

                entity.HasOne(hi => hi.House)
                    .WithOne(h => h.HouseInfo)
                    .HasForeignKey<HouseInfo>(hi => hi.IdHouse)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(hi => hi.IdHouse);
                entity.HasIndex(hi => hi.City);
            });

            // Конфигурация PhotoHouses
            modelBuilder.Entity<PhotoHouse>(entity =>
            {
                entity.ToTable("Photo_houses");
                entity.HasKey(ph => ph.Id);
                
                entity.Property(ph => ph.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                entity.Property(ph => ph.IdHouse)
                    .HasColumnName("id_house")
                    .IsRequired();
                
                entity.Property(ph => ph.Photo)
                    .HasColumnName("photo")
                    .IsRequired()
                    .HasMaxLength(500);

                entity.HasOne(ph => ph.House)
                    .WithMany(h => h.Photos)
                    .HasForeignKey(ph => ph.IdHouse)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(ph => ph.IdHouse);
            });

            // Конфигурация ReviewHouses
            modelBuilder.Entity<ReviewHouse>(entity =>
            {
                entity.ToTable("Reviews_houses");
                entity.HasKey(rh => rh.Id);
                
                entity.Property(rh => rh.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                entity.Property(rh => rh.IdUser)
                    .HasColumnName("id_user")
                    .IsRequired();
                
                entity.Property(rh => rh.Rating)
                    .HasColumnName("rating")
                    .IsRequired();
                
                entity.Property(rh => rh.Text)
                    .HasColumnName("text")
                    .IsRequired()
                    .HasMaxLength(1000);
                
                entity.Property(rh => rh.IdHouses)
                    .HasColumnName("id_houses")
                    .IsRequired();
                
                entity.Property(rh => rh.DataReviews)
                    .HasColumnName("data_reviews")
                    .IsRequired()
                    .HasColumnType("date");

                entity.HasOne(rh => rh.User)
                    .WithMany()
                    .HasForeignKey(rh => rh.IdUser)
                    .OnDelete(DeleteBehavior.Restrict);
                
                entity.HasOne(rh => rh.House)
                    .WithMany(h => h.Reviews)
                    .HasForeignKey(rh => rh.IdHouses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(rh => rh.IdHouses);
                entity.HasIndex(rh => rh.IdUser);
                entity.HasIndex(rh => rh.Rating);
            });

            // Конфигурация Convenience
            modelBuilder.Entity<Convenience>(entity =>
            {
                entity.ToTable("Convenience");
                entity.HasKey(c => c.Id);
                
                entity.Property(c => c.Id)
                    .HasColumnName("id")
                    .ValueGeneratedOnAdd();
                
                entity.Property(c => c.IdHouse)
                    .HasColumnName("id_house")
                    .IsRequired();
                
                entity.Property(c => c.Conditioner)
                    .HasColumnName("conditioner")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Furniture)
                    .HasColumnName("furniture")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Internet)
                    .HasColumnName("internet")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Security)
                    .HasColumnName("security")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.VideoSurveillance)
                    .HasColumnName("video_surveillance")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.FireAlarm)
                    .HasColumnName("fire_alarm")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Parking)
                    .HasColumnName("parking")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Garage)
                    .HasColumnName("garage")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Garden)
                    .HasColumnName("garden")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.SwimmingPool)
                    .HasColumnName("swimming_pool")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Sauna)
                    .HasColumnName("sauna")
                    .HasDefaultValue(false);
                
                entity.Property(c => c.Transport)
                    .HasColumnName("transport")
                    .HasMaxLength(500)
                    .HasDefaultValue("");
                
                entity.Property(c => c.Education)
                    .HasColumnName("education")
                    .HasMaxLength(500)
                    .HasDefaultValue("");
                
                entity.Property(c => c.Shops)
                    .HasColumnName("shops")
                    .HasMaxLength(500)
                    .HasDefaultValue("");

                entity.HasOne(c => c.House)
                    .WithOne(h => h.Convenience)
                    .HasForeignKey<Convenience>(c => c.IdHouse)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(c => c.IdHouse);
            });
        }
    }
}