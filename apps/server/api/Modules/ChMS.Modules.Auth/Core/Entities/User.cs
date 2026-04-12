using System.ComponentModel.DataAnnotations;
using ChMS.Modules.Auth.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace ChMS.Modules.Auth.Core.Entities
{
    [Index(nameof(Email), IsUnique = true)]
    public class User
    {
        public Guid Id { get; set; }

        [MaxLength(100)]
        [Required]
        [MinLength(3)]
        public required string Name { get; set; }

        [MaxLength(150)]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        [Required]
        public required string Email { get; set; }
        public required string PasswordHash { get; set; }

        [Required]
        public UserRole Role { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
