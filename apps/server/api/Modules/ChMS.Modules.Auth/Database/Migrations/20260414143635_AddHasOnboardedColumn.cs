using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ChMS.Modules.Auth.Database.Migrations
{
    /// <inheritdoc />
    public partial class AddHasOnboardedColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasOnboarded",
                schema: "auth",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasOnboarded",
                schema: "auth",
                table: "Users");
        }
    }
}
