using System.Collections.Generic;

namespace API.Entities
{
    public class Lobby
    {
        public string Id { get; set; } = string.Empty;
        public List<Player> Players { get; set; } = [];
        public string HostId { get; set; } = string.Empty;
        public Player Host { get; set; } = null!;
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