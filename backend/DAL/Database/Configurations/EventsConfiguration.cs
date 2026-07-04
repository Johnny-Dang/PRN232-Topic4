using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Configurations
{
    public class EventsConfiguration : IEntityTypeConfiguration<Events>
    {
        public void Configure(EntityTypeBuilder<Events> builder)
        {
            builder.ToTable("Events");

            builder.HasKey(x => x.EventId);

            builder.Property(x => x.EventName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.Season)
                .HasMaxLength(50);

            builder.Property(x => x.Description)
                .HasColumnType("nvarchar(max)");

            builder.Property(x => x.StartDate)
                .HasColumnType("datetime");

            builder.Property(x => x.EndDate)
                .HasColumnType("datetime");

            builder.Property(x => x.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Draft");

            builder.Property(x => x.IsPublished)
                .HasDefaultValue(false);

            builder.Property(x => x.PublishedAt)
                .HasColumnType("datetime");

            builder.Property(x => x.IsFeatured)
                .HasDefaultValue(false);

            builder.Property(x => x.BannerUrl)
                .HasMaxLength(2000);

            builder.Property(x => x.Organizer)
                .HasMaxLength(255);

            builder.Property(x => x.Format)
                .HasMaxLength(50)
                .HasDefaultValue("Online");

            builder.Property(x => x.Audience)
                .HasMaxLength(100)
                .HasDefaultValue("Students");

            builder.Property(x => x.Prize)
                .HasMaxLength(255);

            builder.Property(x => x.IsDeleted)
                .HasDefaultValue(false);

            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasIndex(x => new { x.IsPublished, x.IsFeatured, x.StartDate });
        }
    }
}
