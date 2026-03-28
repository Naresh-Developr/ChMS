using ChMS.Modules.Auth.Controllers;
using ChMS.Modules.Auth.Core.DTOs;
using ChMS.Modules.Auth.Core.Entities;
using ChMS.Modules.Auth.Core.Enums;
using ChMS.Modules.Auth.Database;
using ChMS.Modules.Auth.Infrastructure;
using EZXception.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ChMS.Modules.Auth.Application.Services
{
    public class AuthService(AuthDbContext authDbContext, JwtService jwtService)
    {
        private readonly AuthDbContext _db = authDbContext;
        private readonly JwtService _jwt = jwtService;

        public async Task<Guid> Signup(SignUpRequest signUpRequest)
        {
            bool duplicateEmail = await _db.Users.AnyAsync(u => u.Email == signUpRequest.Email);

            if (duplicateEmail)
                throw new DuplicateEntityException("Email", signUpRequest.Email);

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = signUpRequest.Name,
                Email = signUpRequest.Email,
                PasswordHash = PasswordHasher.HashPassword(signUpRequest.Password),
                Role = signUpRequest.Role,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user.Id;
        }

        public async Task<string> Signin(string email, string password)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email);

            if (user == null)
                throw new Exception("Invalid credentials");

            if (!PasswordHasher.ValidatePassword(password, user.PasswordHash))
                throw new Exception("Invalid credentials");

            return _jwt.GenerateToken(user);
        }
    }
}
