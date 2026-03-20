using ChMS.Modules.Auth.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace ChMS.Modules.Auth.Database
{
    public sealed class AuthDbContext(DbContextOptions<AuthDbContext> options) : DbContext(options)
    {
        internal DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema(Schema.Name);
        }
    }
}
