using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class SubmissionAssetsConfiguration : IEntityTypeConfiguration<SubmissionAssets>
    {
        public void Configure(EntityTypeBuilder<SubmissionAssets> builder)
        {
            builder.ToTable("SubmissionAssets");

            builder.HasKey(x => x.SubmissionAssetId);

            builder.Property(x => x.AssetType)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.Provider)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.CloudinaryAssetId)
                .HasMaxLength(255);

            builder.Property(x => x.PublicId)
                .HasMaxLength(500);

            builder.Property(x => x.SecureUrl)
                .HasMaxLength(2000);

            builder.Property(x => x.ResourceType)
                .HasMaxLength(20)
                .IsRequired();

            builder.Property(x => x.OriginalFileName)
                .HasMaxLength(255);

            builder.Property(x => x.Format)
                .HasMaxLength(20);

            builder.Property(x => x.ContentType)
                .HasMaxLength(150);

            builder.Property(x => x.UploadStatus)
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime");

            builder.Property(x => x.UploadedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.Submission)
                .WithMany(s => s.SubmissionAssets)
                .HasForeignKey(x => x.SubmissionId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(x => x.Team)
                .WithMany(t => t.SubmissionAssets)
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Round)
                .WithMany(r => r.SubmissionAssets)
                .HasForeignKey(x => x.RoundId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.TeamId, x.RoundId, x.AssetType, x.UploadStatus });
            builder.HasIndex(x => x.PublicId);
        }
    }
}
