using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class CreateHousesTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Houses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    area = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    id_owner = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    active = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    announcement_data = table.Column<DateOnly>(type: "date", nullable: false),
                    house_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Коттедж")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Houses", x => x.id);
                    table.ForeignKey(
                        name: "FK_Houses_Users_id_owner",
                        column: x => x.id_owner,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Convenience",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_house = table.Column<int>(type: "int", nullable: false),
                    conditioner = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    furniture = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    internet = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    security = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    video_surveillance = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    fire_alarm = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    parking = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    garage = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    garden = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    swimming_pool = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    sauna = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    transport = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false, defaultValue: ""),
                    education = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false, defaultValue: ""),
                    shops = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false, defaultValue: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Convenience", x => x.id);
                    table.ForeignKey(
                        name: "FK_Convenience_Houses_id_house",
                        column: x => x.id_house,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Houses_info",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_house = table.Column<int>(type: "int", nullable: false),
                    region = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    city = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    street = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    rooms = table.Column<int>(type: "int", nullable: false),
                    bathrooms = table.Column<int>(type: "int", nullable: false),
                    floor = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Houses_info", x => x.id);
                    table.ForeignKey(
                        name: "FK_Houses_info_Houses_id_house",
                        column: x => x.id_house,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Photo_houses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_house = table.Column<int>(type: "int", nullable: false),
                    photo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Photo_houses", x => x.id);
                    table.ForeignKey(
                        name: "FK_Photo_houses_Houses_id_house",
                        column: x => x.id_house,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews_houses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_user = table.Column<int>(type: "int", nullable: false),
                    rating = table.Column<int>(type: "int", nullable: false),
                    text = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    id_houses = table.Column<int>(type: "int", nullable: false),
                    data_reviews = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews_houses", x => x.id);
                    table.ForeignKey(
                        name: "FK_Reviews_houses_Houses_id_houses",
                        column: x => x.id_houses,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_houses_Users_id_user",
                        column: x => x.id_user,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Convenience_id_house",
                table: "Convenience",
                column: "id_house",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Houses_active",
                table: "Houses",
                column: "active");

            migrationBuilder.CreateIndex(
                name: "IX_Houses_announcement_data",
                table: "Houses",
                column: "announcement_data");

            migrationBuilder.CreateIndex(
                name: "IX_Houses_house_type",
                table: "Houses",
                column: "house_type");

            migrationBuilder.CreateIndex(
                name: "IX_Houses_id_owner",
                table: "Houses",
                column: "id_owner");

            migrationBuilder.CreateIndex(
                name: "IX_Houses_info_city",
                table: "Houses_info",
                column: "city");

            migrationBuilder.CreateIndex(
                name: "IX_Houses_info_id_house",
                table: "Houses_info",
                column: "id_house",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Photo_houses_id_house",
                table: "Photo_houses",
                column: "id_house");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_houses_id_houses",
                table: "Reviews_houses",
                column: "id_houses");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_houses_id_user",
                table: "Reviews_houses",
                column: "id_user");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_houses_rating",
                table: "Reviews_houses",
                column: "rating");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Convenience");

            migrationBuilder.DropTable(
                name: "Houses_info");

            migrationBuilder.DropTable(
                name: "Photo_houses");

            migrationBuilder.DropTable(
                name: "Reviews_houses");

            migrationBuilder.DropTable(
                name: "Houses");
        }
    }
}
