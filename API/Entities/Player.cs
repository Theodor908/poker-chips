namespace API.Entities
{
    public class Player
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int Chips { get; set; }
        public bool IsHost { get; set; }
        public bool IsActive { get; set; } = true;
        public string LobbyId { get; set; }
        public Lobby Lobby { get; set; }
    }
}