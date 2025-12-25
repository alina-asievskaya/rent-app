using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class CreateFeedbackTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Feedback",
                columns: table => new
                {
                    id_feedback = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_user = table.Column<int>(type: "int", nullable: false),
                    topic = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    text = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedback", x => x.id_feedback);
                    table.ForeignKey(
                        name: "FK_Feedback_Users_id_user",
                        column: x => x.id_user,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_created_at",
                table: "Feedback",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "IX_Feedback_id_user",
                table: "Feedback",
                column: "id_user");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Feedback");
        }
    }
}
