using System.Collections.Generic;
using API.Entities;

namespace API.Dtos
{
    public class LobbyDto
    {
        public string Id { get; set; } = string.Empty;
        public List<PlayerDto> Players { get; set; } = [];
        public string HostId { get; set; } = string.Empty;
        public int StartingChips { get; set; }
        public int SmallBlind { get; set; }
        public int BigBlind { get; set; }
        public GameRound CurrentRound { get; set; }
        public string? CurrentPlayerId { get; set; }
        public int Pot { get; set; }
        public int CurrentBet { get; set; }
        public int SmallBlindIndex { get; set; }
        public int BigBlindIndex { get; set; }
    }
}