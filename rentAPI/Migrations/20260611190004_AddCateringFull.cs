using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCateringFull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CateringOrders",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    booking_id = table.Column<int>(type: "int", nullable: false),
                    catering_owner_id = table.Column<int>(type: "int", nullable: false),
                    house_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    items_json = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    responded_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CateringOrders", x => x.id);
                    table.ForeignKey(
                        name: "FK_CateringOrders_Bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "Bookings",
                        principalColumn: "id_booking",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CateringOrders_CateringOwners_catering_owner_id",
                        column: x => x.catering_owner_id,
                        principalTable: "CateringOwners",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CateringOrders_Houses_house_id",
                        column: x => x.house_id,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CateringOrders_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HouseCaterings",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    house_id = table.Column<int>(type: "int", nullable: false),
                    catering_owner_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseCaterings", x => x.id);
                    table.ForeignKey(
                        name: "FK_HouseCaterings_CateringOwners_catering_owner_id",
                        column: x => x.catering_owner_id,
                        principalTable: "CateringOwners",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HouseCaterings_Houses_house_id",
                        column: x => x.house_id,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CateringOrders_booking_id",
                table: "CateringOrders",
                column: "booking_id");

            migrationBuilder.CreateIndex(
                name: "IX_CateringOrders_catering_owner_id",
                table: "CateringOrders",
                column: "catering_owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_CateringOrders_house_id",
                table: "CateringOrders",
                column: "house_id");

            migrationBuilder.CreateIndex(
                name: "IX_CateringOrders_status",
                table: "CateringOrders",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_CateringOrders_user_id",
                table: "CateringOrders",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_HouseCaterings_catering_owner_id",
                table: "HouseCaterings",
                column: "catering_owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_HouseCaterings_house_id_catering_owner_id",
                table: "HouseCaterings",
                columns: new[] { "house_id", "catering_owner_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CateringOrders");

            migrationBuilder.DropTable(
                name: "HouseCaterings");
        }
    }
}
