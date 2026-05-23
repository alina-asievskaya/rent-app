using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingDecorationItems");

            migrationBuilder.DropTable(
                name: "BookingFoodItems");

            migrationBuilder.AddColumn<string>(
                name: "house_number",
                table: "Houses_info",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "house_number",
                table: "Houses_info");

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
                    item_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    restaurant_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
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
        }
    }
}
