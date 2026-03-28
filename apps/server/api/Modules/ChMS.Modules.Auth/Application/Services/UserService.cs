using System;
using System.Collections.Generic;
using System.Text;
using ChMS.Modules.Auth.Core.Entities;
using ChMS.Modules.Auth.Database;
using EZXception.Data;

namespace ChMS.Modules.Auth.Application.Services
{
    public class UserService(AuthDbContext authDbContext)
    {
        private readonly AuthDbContext _db = authDbContext;

        public async Task<User> GetUserById(Guid id)
        {
            var user = _db.Users.FirstOrDefault(u => u.Id == id);

            return user == null ? throw new EntityNotFoundException("User", id) : user;
        }
    }
}
