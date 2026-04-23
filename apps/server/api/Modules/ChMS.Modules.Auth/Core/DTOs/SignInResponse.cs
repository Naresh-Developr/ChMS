using System;
using System.Collections.Generic;
using System.Text;
using ChMS.Modules.Auth.Core.Enums;
using Microsoft.AspNetCore.Identity;

namespace ChMS.Modules.Auth.Core.DTOs
{
    public class SignInResponse
    {
        public required string AccessToken { get; set; }
        public DateTime ExpiresOn { get; set; }
        public required UserInfo User { get; set; }
        public required bool HasOnboarded { get; set; }

        public class UserInfo
        {
            public Guid Id { get; set; }
            public required string Name { get; set; }
            public required string Email { get; set; }
            public UserRole Role { get; set; }
        }
    }
}
