using ChMS.Modules.Auth.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ChMS.Modules.Auth
{
    public static class AuthModule
    {
        public static IServiceCollection AddAuthModule(this IServiceCollection services, IConfiguration configuration)
        {
            string dbConnectionString = configuration.GetConnectionString("Database")!;

            services.AddDbContext<AuthDbContext>(options =>
            {
                options.UseNpgsql(
                    dbConnectionString,
                    npgsqlOptions =>
                        npgsqlOptions.MigrationsHistoryTable(HistoryRepository.DefaultTableName, Schema.Name)
                );
            });

            return services;
        }
    }
}
