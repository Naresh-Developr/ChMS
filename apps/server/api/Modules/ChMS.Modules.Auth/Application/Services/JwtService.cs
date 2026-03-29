using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChMS.Modules.Auth.Application.Settings;
using ChMS.Modules.Auth.Core.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace ChMS.Modules.Auth.Application.Services
{
    public sealed class JwtService
    {
        private readonly JwtSettings _jwtSettings;

        public JwtService(IOptions<JwtSettings> options)
        {
            _jwtSettings = options.Value;
        }

        public (string Token, DateTime ExpiresOn) GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Name, user.Name),
                new(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("Role", user.Role.ToString()),
            };

            var expiresOn = DateTime.UtcNow.AddMinutes(int.Parse(_jwtSettings.ExpirationMinutes));

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Secret));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: expiresOn,
                signingCredentials: creds
            );

            return (new JwtSecurityTokenHandler().WriteToken(token), expiresOn);
        }
    }
}
