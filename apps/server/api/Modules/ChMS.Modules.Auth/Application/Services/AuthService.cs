using ChMS.Modules.Auth.Core.Entities;
using ChMS.Modules.Auth.Core.Enums;
using ChMS.Modules.Auth.Database;
using ChMS.Modules.Auth.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace ChMS.Modules.Auth.Application.Services
{
    public class AuthService
    {
        private readonly AuthDbContext _db;
        private readonly JwtService _jwt;

        public AuthService(AuthDbContext db, JwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        public async Task<string> Register(string username, string email, string password)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Email = email,
                PasswordHash = PasswordHasher.Hash(password),
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return _jwt.GenerateToken(user);
        }

        public async Task<string> Login(string email, string password)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);

            if (user == null)
                throw new Exception("Invalid credentials");

            if (!PasswordHasher.Verify(password, user.PasswordHash))
                throw new Exception("Invalid credentials");

            return _jwt.GenerateToken(user);
        }
    }
}