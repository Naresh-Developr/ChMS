using ChMS.Modules.Auth.Core.DTOs;
using ChMS.Modules.Auth.Core.Entities;
using ChMS.Modules.Auth.Database;
using ChMS.Modules.Auth.Infrastructure;
using EZXception.Authorization;
using EZXception.Data;
using Microsoft.EntityFrameworkCore;

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
                Name = signUpRequest.Name,
                Email = signUpRequest.Email,
                PasswordHash = PasswordHasher.HashPassword(signUpRequest.Password),
                Role = signUpRequest.Role,
                IsActive = signUpRequest.Role != Core.Enums.UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user.Id;
        }

        public async Task<SignInResponse> Signin(string email, string password)
        {
            var user =
                await _db.Users.FirstOrDefaultAsync(u => u.Email == email) ?? throw new InvalidCredentialsException();

            if (!PasswordHasher.ValidatePassword(password, user.PasswordHash))
                throw new InvalidCredentialsException();

            if (!user.IsActive)
                throw new UnauthorizedAccessException($"Access Denied: Account is not active");

            var (token, expiresOn) = _jwt.GenerateToken(user);

            return new SignInResponse
            {
                AccessToken = token,
                ExpiresOn = expiresOn,
                User = new SignInResponse.UserInfo
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Role = user.Role,
                },
            };
        }
    }
}
