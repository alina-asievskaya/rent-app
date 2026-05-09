using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bookings",
                columns: table => new
                {
                    id_booking = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_house = table.Column<int>(type: "int", nullable: false),
                    id_user = table.Column<int>(type: "int", nullable: false),
                    booking_date = table.Column<DateOnly>(type: "date", nullable: false),
                    approved = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bookings", x => x.id_booking);
                    table.ForeignKey(
                        name: "FK_Bookings_Houses_id_house",
                        column: x => x.id_house,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bookings_Users_id_user",
                        column: x => x.id_user,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BookingDecorationItems",
                columns: table => new
                {
                    id_booking_decoration = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_booking = table.Column<int>(type: "int", nullable: false),
                    category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    item_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingDecorationItems", x => x.id_booking_decoration);
                    table.ForeignKey(
                        name: "FK_BookingDecorationItems_Bookings_id_booking",
                        column: x => x.id_booking,
                        principalTable: "Bookings",
                        principalColumn: "id_booking",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BookingFoodItems",
                columns: table => new
                {
                    id_booking_food = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_booking = table.Column<int>(type: "int", nullable: false),
                    restaurant_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    item_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false, defaultValue: 1)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingFoodItems", x => x.id_booking_food);
                    table.ForeignKey(
                        name: "FK_BookingFoodItems_Bookings_id_booking",
                        column: x => x.id_booking,
                        principalTable: "Bookings",
                        principalColumn: "id_booking",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingDecorationItems_id_booking",
                table: "BookingDecorationItems",
                column: "id_booking");

            migrationBuilder.CreateIndex(
                name: "IX_BookingFoodItems_id_booking",
                table: "BookingFoodItems",
                column: "id_booking");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_booking_date",
                table: "Bookings",
                column: "booking_date");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_id_house",
                table: "Bookings",
                column: "id_house");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_id_house_booking_date",
                table: "Bookings",
                columns: new[] { "id_house", "booking_date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_id_user",
                table: "Bookings",
                column: "id_user");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingDecorationItems");

            migrationBuilder.DropTable(
                name: "BookingFoodItems");

            migrationBuilder.DropTable(
                name: "Bookings");
        }
    }
}
