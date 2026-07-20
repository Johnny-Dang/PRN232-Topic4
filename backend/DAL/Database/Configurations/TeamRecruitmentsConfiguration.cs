using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class TeamRecruitmentsConfiguration : IEntityTypeConfiguration<TeamRecruitments>
    {
        public void Configure(EntityTypeBuilder<TeamRecruitments> builder)
        {
            builder.ToTable("TeamRecruitments");

            builder.HasKey(x => x.RecruitmentId);

            builder.Property(x => x.RoleNeeded)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);

            builder.Property(x => x.Quantity)
                .HasDefaultValue(1);

            builder.Property(x => x.Status)
                .HasMaxLength(20)
                .HasDefaultValue("OPEN");

            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime");

            builder.Property(x => x.UpdatedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.Team)
                .WithMany()
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
