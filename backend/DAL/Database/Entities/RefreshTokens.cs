using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DataAccessLayer.Database.Entities
{
    public class RefreshTokens
    {
        [Key]
        public Guid RefreshTokenId { get; set; }

        [Required]
        public string Token { get; set; } = string.Empty;

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public DateTime ExpiresAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public DateTime? RevokedAt { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

        public bool IsRevoked => RevokedAt != null;

        public bool IsActive => !IsRevoked && !IsExpired;

        // Navigation property
        [ForeignKey("UserId")]
        public virtual Users User { get; set; } = null!;
    }
}