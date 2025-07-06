using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Lobbies",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    HostId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StartingChips = table.Column<int>(type: "int", nullable: false),
                    SmallBlind = table.Column<int>(type: "int", nullable: false),
                    BigBlind = table.Column<int>(type: "int", nullable: false),
                    CurrentRound = table.Column<int>(type: "int", nullable: false),
                    CurrentPlayerId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Pot = table.Column<int>(type: "int", nullable: false),
                    CurrentBet = table.Column<int>(type: "int", nullable: false),
                    SmallBlindIndex = table.Column<int>(type: "int", nullable: false),
                    BigBlindIndex = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lobbies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Players",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeviceId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Chips = table.Column<int>(type: "int", nullable: false),
                    Pot = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    IsHost = table.Column<bool>(type: "bit", nullable: false),
                    IsSmallBlind = table.Column<bool>(type: "bit", nullable: false),
                    IsBigBlind = table.Column<bool>(type: "bit", nullable: false),
                    IsTurn = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CurrentBet = table.Column<int>(type: "int", nullable: false),
                    HasActed = table.Column<bool>(type: "bit", nullable: false),
                    LobbyId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Players_Lobbies_LobbyId",
                        column: x => x.LobbyId,
                        principalTable: "Lobbies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Lobbies_HostId",
                table: "Lobbies",
                column: "HostId");

            migrationBuilder.CreateIndex(
                name: "IX_Players_LobbyId",
                table: "Players",
                column: "LobbyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Lobbies_Players_HostId",
                table: "Lobbies",
                column: "HostId",
                principalTable: "Players",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Lobbies_Players_HostId",
                table: "Lobbies");

            migrationBuilder.DropTable(
                name: "Players");

            migrationBuilder.DropTable(
                name: "Lobbies");
        }
    }
}
