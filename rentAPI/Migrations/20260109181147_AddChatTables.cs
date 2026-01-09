using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddChatTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Chats",
                columns: table => new
                {
                    id_chat = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_user1 = table.Column<int>(type: "int", nullable: false),
                    id_user2 = table.Column<int>(type: "int", nullable: false),
                    id_house = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Chats", x => x.id_chat);
                    table.CheckConstraint("CK_Different_Users", "id_user1 <> id_user2");
                    table.ForeignKey(
                        name: "FK_Chats_Houses_id_house",
                        column: x => x.id_house,
                        principalTable: "Houses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Chats_Users_id_user1",
                        column: x => x.id_user1,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Chats_Users_id_user2",
                        column: x => x.id_user2,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    id_message = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_chat = table.Column<int>(type: "int", nullable: false),
                    id_sender = table.Column<int>(type: "int", nullable: false),
                    message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    is_read = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.id_message);
                    table.CheckConstraint("CK_Message_NotEmpty", "LEN(TRIM([message])) > 0");
                    table.ForeignKey(
                        name: "FK_Messages_Chats_id_chat",
                        column: x => x.id_chat,
                        principalTable: "Chats",
                        principalColumn: "id_chat",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Messages_Users_id_sender",
                        column: x => x.id_sender,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Chats_created_at",
                table: "Chats",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_id_house",
                table: "Chats",
                column: "id_house");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_id_user1",
                table: "Chats",
                column: "id_user1");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_id_user1_id_user2_id_house",
                table: "Chats",
                columns: new[] { "id_user1", "id_user2", "id_house" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Chats_id_user2",
                table: "Chats",
                column: "id_user2");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_created_at",
                table: "Messages",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_id_chat",
                table: "Messages",
                column: "id_chat");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_id_chat_is_read_created_at",
                table: "Messages",
                columns: new[] { "id_chat", "is_read", "created_at" });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_id_sender",
                table: "Messages",
                column: "id_sender");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_is_read",
                table: "Messages",
                column: "is_read");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Chats");
        }
    }
}
