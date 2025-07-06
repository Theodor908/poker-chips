using API.Data;
using API.Dtos;
using API.Entities;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace API.SignalR
{
    public class PokerHub : Hub
    {
        private readonly ILogger<PokerHub> _logger;
        private readonly DataContext _context;
        private static readonly ConcurrentDictionary<string, Lobby> _lobbies = new ConcurrentDictionary<string, Lobby>();

        public PokerHub(ILogger<PokerHub> logger, DataContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task JoinLobby(string lobbyId, string playerName, string deviceId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, lobbyId);
            Context.Items["LobbyId"] = lobbyId;

            // Step 1: Find or create the player.
            var player = await _context.Players.FindAsync(deviceId);
            if (player == null)
            {
                player = new Player
                {
                    Id = deviceId,
                    Name = string.IsNullOrEmpty(playerName) ? "Player" + new Random().Next(1000, 9999) : playerName,
                    DeviceId = deviceId
                };
                _context.Players.Add(player);
                await _context.SaveChangesAsync(); // Save the new player immediately to get an ID.
            }
            else
            {
                player.IsActive = true; // Mark existing player as active.
            }

            // Step 2: Find or create the lobby.
            var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
            if (lobby == null)
            {
                lobby = new Lobby
                {
                    Id = lobbyId,
                    HostId = player.Id, // The creator is the host.
                    StartingChips = 1000,
                    SmallBlind = 5,
                    BigBlind = 10
                };
                _context.Lobbies.Add(lobby);
            }

            // Step 3: Update player and lobby states.
            player.LobbyId = lobbyId;

            // The first player in the lobby is the host.
            if (!lobby.Players.Any())
            {
                player.IsHost = true;
                lobby.HostId = player.Id;
            }

            if (lobby.Players.All(p => p.Id != player.Id))
            {
                lobby.Players.Add(player);
            }

            // Step 4: Save final changes and notify clients.
            await _context.SaveChangesAsync();

            await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(lobby));
        }

        public async Task StartGame(string lobbyId, int pot, int smallBlind, int bigBlind)
        {
            var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
            if (lobby != null)
            {
                lobby.Pot = pot;
                lobby.SmallBlind = smallBlind;
                lobby.BigBlind = bigBlind;

                foreach (var player in lobby.Players)
                {
                    player.Chips = lobby.StartingChips;
                }

                if (lobby.Players.Count > 0)
                {
                    lobby.Players[0].IsSmallBlind = true;
                }
                if (lobby.Players.Count > 1)
                {
                    lobby.Players[1].IsBigBlind = true;
                }
                if (lobby.Players.Count > 2)
                {
                    lobby.Players[2].IsTurn = true;
                }

                await _context.SaveChangesAsync();
                await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(lobby));
            }
        }

        public async Task UpdateSettings(string lobbyId, int pot, int smallBlind, int bigBlind)
        {
            var lobby = await _context.Lobbies.FindAsync(lobbyId);
            if (lobby != null)
            {
                lobby.StartingChips = pot;
                lobby.SmallBlind = smallBlind;
                lobby.BigBlind = bigBlind;
                await _context.SaveChangesAsync();
                await Clients.Group(lobbyId).SendAsync("LobbySettingsChanged", ToLobbyDto(lobby));
            }
        }

        public async Task UpdatePlayerOrder(string lobbyId, List<Player> players)
        {
            var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
            if (lobby != null)
            {
                for (int i = 0; i < players.Count; i++)
                {
                    var player = lobby.Players.FirstOrDefault(p => p.Id == players[i].Id);
                    if (player != null)
                    {
                        player.Order = i;
                    }
                }
                await _context.SaveChangesAsync();
                var updatedLobby = await _context.Lobbies.Include(l => l.Players.OrderBy(p => p.Order)).FirstOrDefaultAsync(l => l.Id == lobbyId);
                await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(updatedLobby!));
            }
        }

        public override async Task OnDisconnectedAsync(System.Exception? exception)
        {
            if (Context.Items.TryGetValue("LobbyId", out var lobbyIdObj) && lobbyIdObj is string lobbyId)
            {
                var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
                if (lobby != null)
                {
                    var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                    if (player != null)
                    {
                        player.IsActive = false;
                        await _context.SaveChangesAsync();
                        await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(lobby));
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task Check(string lobbyId)
        {
            var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
            if (lobby != null)
            {
                var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                if (player != null && player.Id == lobby.CurrentPlayerId)
                {
                    player.HasActed = true;
                    AdvanceTurn(lobby);
                    await _context.SaveChangesAsync();
                    await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(lobby));
                }
            }
        }

        public async Task Fold(string lobbyId)
        {
            var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
            if (lobby != null)
            {
                var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                if (player != null && player.Id == lobby.CurrentPlayerId)
                {
                    player.IsActive = false;
                    player.HasActed = true;
                    AdvanceTurn(lobby);
                    await _context.SaveChangesAsync();
                    await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(lobby));
                }
            }
        }

        public async Task LeaveLobby(string lobbyId)
        {
            var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
            if (lobby != null)
            {
                var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                if (player != null)
                {
                    _context.Players.Remove(player);
                    await _context.SaveChangesAsync();
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, lobbyId);
                    await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(lobby));
                }
            }
        }

        private void StartNewRound(Lobby lobby)
        {
            lobby.SmallBlindIndex = (lobby.SmallBlindIndex + 1) % lobby.Players.Count;
            lobby.BigBlindIndex = (lobby.SmallBlindIndex + 1) % lobby.Players.Count;

            lobby.CurrentRound = GameRound.PreFlop;
            lobby.Pot = 0;
            lobby.CurrentBet = lobby.BigBlind;

            foreach (var player in lobby.Players)
            {
                player.Chips = lobby.StartingChips;
                player.IsActive = true;
                player.HasActed = false;
                player.CurrentBet = 0;
            }

            var smallBlindPlayer = lobby.Players[lobby.SmallBlindIndex];
            smallBlindPlayer.Chips -= lobby.SmallBlind;
            smallBlindPlayer.CurrentBet = lobby.SmallBlind;
            lobby.Pot += lobby.SmallBlind;

            var bigBlindPlayer = lobby.Players[lobby.BigBlindIndex];
            bigBlindPlayer.Chips -= lobby.BigBlind;
            bigBlindPlayer.CurrentBet = lobby.BigBlind;
            lobby.Pot += lobby.BigBlind;

            if (lobby.Players.Count > 0)
            {
                lobby.CurrentPlayerId = lobby.Players[(lobby.BigBlindIndex + 1) % lobby.Players.Count].Id;
            }
        }
        private void AdvanceRound(Lobby lobby)
        {
            lobby.CurrentBet = 0;
            foreach (var player in lobby.Players)
            {
                player.HasActed = false;
                player.CurrentBet = 0;
            }

            switch (lobby.CurrentRound)
            {
                case GameRound.PreFlop:
                    lobby.CurrentRound = GameRound.Flop;
                    break;
                case GameRound.Flop:
                    lobby.CurrentRound = GameRound.Turn;
                    break;
                case GameRound.Turn:
                    lobby.CurrentRound = GameRound.River;
                    break;
                case GameRound.River:
                    StartNewRound(lobby);
                    break;
            }
        }

        private void AdvanceTurn(Lobby lobby)
        {
            var activePlayers = lobby.Players.Where(p => p.IsActive).ToList();
            if (activePlayers.All(p => p.HasActed && p.CurrentBet == lobby.CurrentBet))
            {
                AdvanceRound(lobby);
                return;
            }

            var currentPlayerIndex = activePlayers.FindIndex(p => p.Id == lobby.CurrentPlayerId);
            var nextPlayerIndex = (currentPlayerIndex + 1) % activePlayers.Count;
            lobby.CurrentPlayerId = activePlayers[nextPlayerIndex].Id;
        }

        public async Task Raise(string lobbyId, int raiseAmount)
        {
            var lobby = await _context.Lobbies.Include(l => l.Players).FirstOrDefaultAsync(l => l.Id == lobbyId);
            if (lobby != null)
            {
                var player = lobby.Players.FirstOrDefault(p => p.Id == Context.ConnectionId);
                if (player != null && player.Id == lobby.CurrentPlayerId)
                {
                    var totalBet = lobby.CurrentBet + raiseAmount;
                    if (player.Chips >= totalBet)
                    {
                        player.Chips -= totalBet;
                        player.CurrentBet = totalBet;
                        lobby.Pot += totalBet;
                        lobby.CurrentBet = totalBet;
                        player.HasActed = true;

                        foreach (var p in lobby.Players)
                        {
                            if (p.Id != player.Id)
                            {
                                p.HasActed = false;
                            }
                        }

                        AdvanceTurn(lobby);
                        await _context.SaveChangesAsync();
                        await Clients.Group(lobbyId).SendAsync("LobbyStateChanged", ToLobbyDto(lobby));
                    }
                }
            }
        }

        private LobbyDto ToLobbyDto(Lobby lobby)
        {
            return new LobbyDto
            {
                Id = lobby.Id,
                Players = lobby.Players.Select(p => new PlayerDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Chips = p.Chips,
                    Pot = p.Pot,
                    Order = p.Order,
                    IsHost = p.IsHost,
                    IsSmallBlind = p.IsSmallBlind,
                    IsBigBlind = p.IsBigBlind,
                    IsTurn = p.IsTurn,
                    IsActive = p.IsActive,
                    CurrentBet = p.CurrentBet,
                    HasActed = p.HasActed,
                }).ToList(),
                HostId = lobby.HostId,
                StartingChips = lobby.StartingChips,
                SmallBlind = lobby.SmallBlind,
                BigBlind = lobby.BigBlind,
                CurrentRound = lobby.CurrentRound,
                CurrentPlayerId = lobby.CurrentPlayerId,
                Pot = lobby.Pot,
                CurrentBet = lobby.CurrentBet,
                SmallBlindIndex = lobby.SmallBlindIndex,
                BigBlindIndex = lobby.BigBlindIndex
            };
        }
    }
}