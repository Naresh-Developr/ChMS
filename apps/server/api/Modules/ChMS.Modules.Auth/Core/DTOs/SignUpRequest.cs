using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using ChMS.Modules.Auth.Core.Enums;

namespace ChMS.Modules.Auth.Core.DTOs
{
    public class SignUpRequest
    {
        [Required]
        [MinLength(3)]
        [MaxLength(100)]
        public required string Name { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        [MaxLength(100)]
        public required string Email { get; set; }

        [Required]
        public required UserRole Role { get; set; }

        [Required]
        [MinLength(8)]
        [RegularExpression(
            @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "Password must be at least 8 characters and include: uppercase, lowercase, number, and special character (@$!%*?&)"
        )]
        public required string Password { get; set; }
    }
}
