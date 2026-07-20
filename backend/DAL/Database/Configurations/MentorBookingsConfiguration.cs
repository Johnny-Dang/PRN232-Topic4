using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class MentorBookingsConfiguration : IEntityTypeConfiguration<MentorBookings>
    {
        public void Configure(EntityTypeBuilder<MentorBookings> builder)
        {
            builder.ToTable("MentorBookings");

            builder.HasKey(x => x.BookingId);

            builder.Property(x => x.Objective)
                .IsRequired()
                .HasMaxLength(1000);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.MeetingLink)
                .HasMaxLength(500);

            builder.Property(x => x.Notes)
                .HasMaxLength(1000);

            builder.HasOne(x => x.Schedule)
                .WithMany(s => s.MentorBookings)
                .HasForeignKey(x => x.ScheduleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Team)
                .WithMany(t => t.MentorBookings)
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Mentor)
                .WithMany()
                .HasForeignKey(x => x.MentorUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
