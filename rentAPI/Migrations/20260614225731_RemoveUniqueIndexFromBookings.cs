using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniqueIndexFromBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_id_house_booking_date",
                table: "Bookings");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_id_house_booking_date",
                table: "Bookings",
                columns: new[] { "id_house", "booking_date" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_id_house_booking_date",
                table: "Bookings");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_id_house_booking_date",
                table: "Bookings",
                columns: new[] { "id_house", "booking_date" },
                unique: true,
                filter: "[approved] = 1");
        }
    }
}
