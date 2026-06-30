using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DataAccessLayer.Database.Configurations
{
    public class NotificationsConfiguration : IEntityTypeConfiguration<Notifications>
    {
        public void Configure(EntityTypeBuilder<Notifications> builder)
        {
            builder.ToTable("Notifications");

            builder.HasKey(x => x.NotificationId);

            builder.Property(x => x.Message)
                .HasColumnType("nvarchar(max)")
                .IsRequired();

            builder.Property(x => x.IsRead)
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime")
                .IsRequired();

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
