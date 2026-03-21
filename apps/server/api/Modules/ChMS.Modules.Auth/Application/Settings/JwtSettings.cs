using System;
using System.Collections.Generic;
using System.Text;

namespace ChMS.Modules.Auth.Application.Settings
{
    public class JwtSettings
    {
        public required string Secret { get; set; }
        public required string Issuer { get; set; }
        public required string Audience { get; set; }
        public required string ExpirationMinutes { get; set; }
    }
}
