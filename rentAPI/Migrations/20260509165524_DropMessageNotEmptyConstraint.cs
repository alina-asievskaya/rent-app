using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace rentAPI.Migrations
{
    /// <inheritdoc />
    public partial class DropMessageNotEmptyConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DECLARE @constraintName NVARCHAR(200)
                SELECT @constraintName = name FROM sys.check_constraints 
                WHERE parent_object_id = OBJECT_ID('Messages') AND definition LIKE '%message%'
                IF @constraintName IS NOT NULL
                    EXEC('ALTER TABLE Messages DROP CONSTRAINT ' + @constraintName)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                ALTER TABLE Messages ADD CONSTRAINT CK_Message_NotEmpty CHECK (message IS NOT NULL AND message <> '')
            ");
        }
    }
}