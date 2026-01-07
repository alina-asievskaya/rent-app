using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddAgentReviewsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "reviews_count",
                table: "Agents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AgentReviews",
                columns: table => new
                {
                    id_rew_agent = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    id_user = table.Column<int>(type: "int", nullable: false),
                    id_agent = table.Column<int>(type: "int", nullable: false),
                    rating = table.Column<int>(type: "int", nullable: false),
                    text = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    data_reviews = table.Column<DateTime>(type: "date", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgentReviews", x => x.id_rew_agent);
                    table.ForeignKey(
                        name: "FK_AgentReviews_Agents_id_agent",
                        column: x => x.id_agent,
                        principalTable: "Agents",
                        principalColumn: "id_agent",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AgentReviews_Users_id_user",
                        column: x => x.id_user,
                        principalTable: "Users",
                        principalColumn: "id_user",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AgentReviews_data_reviews",
                table: "AgentReviews",
                column: "data_reviews");

            migrationBuilder.CreateIndex(
                name: "IX_AgentReviews_id_agent",
                table: "AgentReviews",
                column: "id_agent");

            migrationBuilder.CreateIndex(
                name: "IX_AgentReviews_id_user",
                table: "AgentReviews",
                column: "id_user");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AgentReviews");

            migrationBuilder.DropColumn(
                name: "reviews_count",
                table: "Agents");
        }
    }
}
