using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class TeamApplicationsConfiguration : IEntityTypeConfiguration<TeamApplications>
    {
        public void Configure(EntityTypeBuilder<TeamApplications> builder)
        {
            builder.ToTable("TeamApplications");

            builder.HasKey(x => x.ApplicationId);

            builder.Property(x => x.Message)
                .HasMaxLength(500);

            builder.Property(x => x.Status)
                .HasMaxLength(20)
                .HasDefaultValue("PENDING");

            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime");

            builder.Property(x => x.UpdatedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.Recruitment)
                .WithMany(r => r.Applications)
                .HasForeignKey(x => x.RecruitmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Team)
                .WithMany()
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
