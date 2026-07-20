using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class MentoringFeedbacksConfiguration : IEntityTypeConfiguration<MentoringFeedbacks>
    {
        public void Configure(EntityTypeBuilder<MentoringFeedbacks> builder)
        {
            builder.ToTable("MentoringFeedbacks");

            builder.HasKey(x => x.FeedbackId);

            builder.Property(x => x.HealthStatus)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.Content)
                .IsRequired()
                .HasMaxLength(2000);

            builder.HasOne(x => x.Booking)
                .WithMany(b => b.Feedbacks)
                .HasForeignKey(x => x.BookingId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Team)
                .WithMany(t => t.MentoringFeedbacks)
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Mentor)
                .WithMany()
                .HasForeignKey(x => x.MentorUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
