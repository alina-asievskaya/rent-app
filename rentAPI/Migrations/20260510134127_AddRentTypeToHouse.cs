using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddRentTypeToHouse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "rent_type",
                table: "Houses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "rent_type",
                table: "Houses");
        }
    }
}
