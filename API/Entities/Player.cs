using System.Collections.Generic;

namespace API.Entities
{
    public class Player
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string DeviceId { get; set; } = string.Empty;
        public int Chips { get; set; }
        public int Pot { get; set; }
        public int Order { get; set; }
        public bool IsHost { get; set; }
        public bool IsSmallBlind { get; set; }
        public bool IsBigBlind { get; set; }
        public bool IsTurn { get; set; }
        public bool IsActive { get; set; } = true;
        public int CurrentBet { get; set; }
        public bool HasActed { get; set; }
        public string LobbyId { get; set; } = string.Empty;
        public Lobby? Lobby { get; set; }
    }
}