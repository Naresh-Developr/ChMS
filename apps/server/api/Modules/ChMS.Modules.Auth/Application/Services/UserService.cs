using System;
using System.Collections.Generic;
using System.Text;
using ChMS.Modules.Auth.Core.DTOs;
using ChMS.Modules.Auth.Core.Entities;
using ChMS.Modules.Auth.Database;
using EZXception.Data;

namespace ChMS.Modules.Auth.Application.Services
{
    public class UserService(AuthDbContext authDbContext)
    {
        private readonly AuthDbContext _db = authDbContext;

        public async Task<SignInResponse.UserInfo> GetUserById(Guid id)
        {
            var user = _db.Users.FirstOrDefault(u => u.Id == id) ?? throw new EntityNotFoundException("User", id);
            return new SignInResponse.UserInfo
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
            };
        }
    }
}
