using ChMS.Modules.Auth.Database;
using Microsoft.EntityFrameworkCore;

namespace api.Extensions
{
    public static class MigrationExtension
    {
        internal static void RunMigrations(this IApplicationBuilder app)
        {
            using IServiceScope scope = app.ApplicationServices.CreateScope();

            // Add modules here
            RunMigration<AuthDbContext>(scope);
        }

        private static void RunMigration<TDbContext>(IServiceScope scope)
            where TDbContext : DbContext
        {
            using TDbContext context = scope.ServiceProvider.GetRequiredService<TDbContext>();

            context.Database.Migrate();
        }
    }
}
