using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseCateringRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HouseCateringRequests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    house_id = table.Column<int>(type: "int", nullable: false),
                    catering_owner_id = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    responded_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseCateringRequests", x => x.id);
                    table.ForeignKey(
                        name: "FK_HouseCateringRequests_CateringOwners_catering_owner_id",
                        column: x => x.catering_owner_id,
                        principalTable: "CateringOwners",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HouseCateringRequests_Houses_house_id",
                        column: x => x.house_id,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HouseCateringRequests_catering_owner_id",
                table: "HouseCateringRequests",
                column: "catering_owner_id");

            migrationBuilder.CreateIndex(
                name: "IX_HouseCateringRequests_house_id",
                table: "HouseCateringRequests",
                column: "house_id");

            migrationBuilder.CreateIndex(
                name: "IX_HouseCateringRequests_status",
                table: "HouseCateringRequests",
                column: "status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HouseCateringRequests");
        }
    }
}
