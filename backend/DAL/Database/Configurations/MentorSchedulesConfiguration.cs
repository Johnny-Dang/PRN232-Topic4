using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class MentorSchedulesConfiguration : IEntityTypeConfiguration<MentorSchedules>
    {
        public void Configure(EntityTypeBuilder<MentorSchedules> builder)
        {
            builder.ToTable("MentorSchedules");

            builder.HasKey(x => x.ScheduleId);

            builder.Property(x => x.MeetingLocation)
                .HasMaxLength(500);

            builder.HasOne(x => x.Mentor)
                .WithMany()
                .HasForeignKey(x => x.MentorUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
