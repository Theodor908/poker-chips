using System.Collections.Generic;

namespace API.Entities
{
    public class Lobby
    {
        public string Id { get; set; }
        public List<Player> Players { get; set; } = new List<Player>();
        public int StartingChips { get; set; }
        public int SmallBlind { get; set; }
        public int BigBlind { get; set; }
        public GameRound CurrentRound { get; set; }
    }
}