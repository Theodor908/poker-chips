using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
        }

        public DbSet<Lobby> Lobbies { get; set; }
        public DbSet<Player> Players { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Lobby>()
                .HasMany(l => l.Players)
                .WithOne(p => p.Lobby)
                .HasForeignKey(p => p.LobbyId);
        }
    }
}
