using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class UserSkillsConfiguration : IEntityTypeConfiguration<UserSkills>
    {
        public void Configure(EntityTypeBuilder<UserSkills> builder)
        {
            builder.ToTable("UserSkills");

            builder.HasKey(x => x.UserSkillId);

            builder.Property(x => x.Role)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.SkillName)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.ExperienceLevel)
                .HasMaxLength(50);

            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
