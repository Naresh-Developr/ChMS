using System;
using System.Collections.Generic;
using System.Text;
using ChMS.Modules.Auth.Core.Enums;

namespace ChMS.Modules.Auth.Core.DTOs
{
    public class SignUpRequest
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required UserRole Role { get; set; }
        public required string Password { get; set; }
    }
}
