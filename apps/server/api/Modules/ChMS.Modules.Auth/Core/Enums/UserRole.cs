using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace ChMS.Modules.Auth.Core.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum UserRole
    {
        SuperAdmin = 1,
        Admin = 2,
        User = 3,
    }
}
