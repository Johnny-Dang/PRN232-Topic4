using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class EventParticipantsConfiguration : IEntityTypeConfiguration<EventParticipants>
    {
        public void Configure(EntityTypeBuilder<EventParticipants> builder)
        {
            builder.ToTable("EventParticipants");

            builder.HasKey(x => x.EventParticipantId);

            builder.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.RegisteredAt)
                .HasColumnType("datetime");

            builder.HasIndex(x => new { x.UserId, x.EventId })
                .IsUnique();

            builder.HasOne(x => x.User)
                .WithMany(u => u.EventParticipants)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Event)
                .WithMany(e => e.EventParticipants)
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
