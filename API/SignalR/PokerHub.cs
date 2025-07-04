using API.Entities;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class PokerHub : Hub
    {
        private readonly ILogger<PokerHub> _logger;
        private static readonly ConcurrentDictionary<string, LobbyState> _lobbies = new ConcurrentDictionary<string, LobbyState>();

        public PokerHub(ILogger<PokerHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinLobby(string lobbyId, string playerName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);
            Context.Items["LobbyId"] = lobbyId;

            var lobby = _lobbies.GetOrAdd(lobbyId, new LobbyState());
            var player = new Player { Id = Context.ConnectionId, Name = playerName, IsHost = lobby.Players.Count == 0 };
            lobby.Players.Add(player);

            await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", lobby);
        }

        public async Task StartGame(string lobbyId, GameSettings settings)
        {
            if (_lobbies.TryGetValue(lobbyId, out var lobby))
            {
                lobby.Settings = settings;
                lobby.CurrentRound = GameRound.PreFlop;
                await Clients.Group(lobbyId).SendAsync("GameStarted", new { id = lobbyId, lobby });
            }
        }

        public async Task UpdateSettings(string lobbyId, GameSettings settings)
        {
            if (_lobbies.TryGetValue(lobbyId, out var lobby))
            {
                lobby.Settings = settings;
                var connectionIds = lobby.Players.Select(p => p.Id).ToList();
                await Clients.Clients(connectionIds).SendAsync("LobbySettingsChanged", settings);
            }
        }

        public async Task UpdatePlayerOrder(string lobbyId, List<Player> players)
        {
            if (_lobbies.TryGetValue(lobbyId, out var lobby))
            {
                lobby.Players = players;
                var connectionIds = lobby.Players.Select(p => p.Id).ToList();
                await Clients.Clients(connectionIds).SendAsync("LobbyStateChanged", lobby);
            }
        }

        public override async Task OnDisconnectedAsync(System.Exception exception)
        {
            if (Context.Items.TryGetValue("LobbyId", out var lobbyIdObj) && lobbyIdObj is string lobbyId)
            {
                if (_lobbies.TryGetValue(lobbyId, out var lobby))
                {
                    var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                    if (player != null)
                    {
                        lobby.Players.Remove(player);
                        await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", lobby);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task Call(string lobbyId)
        {
            // TODO: Implement call logic
            await Task.CompletedTask;
        }

        public async Task Check(string lobbyId)
        {
            // TODO: Implement check logic
            await Task.CompletedTask;
        }

        public async Task Fold(string lobbyId)
        {
            if (_lobbies.TryGetValue(lobbyId, out var lobby))
            {
                var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                if (player != null)
                {
                    player.IsActive = false;
                    // Simple turn advancement for now
                    var activePlayers = lobby.Players.Where(p => p.IsActive).ToList();
                    var currentPlayerIndex = activePlayers.FindIndex(p => p.Id == lobby.Settings.CurrentPlayerId);
                    if (currentPlayerIndex != -1)
                    {
                        var nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.Count;
                        lobby.Settings.CurrentPlayerId = activePlayers[nextPlayerIndex].Id;
                    }
                    await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", lobby);
                }
            }
        }

        public async Task LeaveLobby(string lobbyId)
        {
            if (_lobbies.TryGetValue(lobbyId, out var lobby))
            {
                var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                if (player != null)
                {
                    lobby.Players.Remove(player);
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyId);
                    await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", lobby);
                }
            }
        }
    }

    public class LobbyState
    {
        public List<Player> Players { get; set; } = new List<Player>();
        public GameSettings Settings { get; set; }
        public GameRound CurrentRound { get; set; }
    }

    public class GameSettings
    {
        public int StartingChips { get; set; }
        public int SmallBlind { get; set; }
        public int BigBlind { get; set; }
        public List<Player> Players { get; set; }
        public string CurrentPlayerId { get; set; }
    }
}