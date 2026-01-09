using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddNullableHouseIdToChats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Chats_id_user1_id_user2_id_house",
                table: "Chats");

            migrationBuilder.AlterColumn<int>(
                name: "id_house",
                table: "Chats",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_id_user1_id_user2_id_house",
                table: "Chats",
                columns: new[] { "id_user1", "id_user2", "id_house" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Chats_id_user1_id_user2_id_house",
                table: "Chats");

            migrationBuilder.AlterColumn<int>(
                name: "id_house",
                table: "Chats",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chats_id_user1_id_user2_id_house",
                table: "Chats",
                columns: new[] { "id_user1", "id_user2", "id_house" },
                unique: true);
        }
    }
}
