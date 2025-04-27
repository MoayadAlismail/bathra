using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Bathra.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateNewStartupTbl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Startups",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    industry = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    stage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    founders = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    team_size = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    founded_date = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    target_market = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    problem_solved = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    usp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    traction = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    key_metrics = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    previous_funding = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    funding_required = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Valuation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    use_of_funds = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    roadmap = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    exit_strategy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    image = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    business_model = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    contact_email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    investment_terms = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    financials = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    market_analysis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    competition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    video_url = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Startups", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Startups");
        }
    }
}
