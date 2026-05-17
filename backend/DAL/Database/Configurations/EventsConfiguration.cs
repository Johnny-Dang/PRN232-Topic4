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
        }
    }
}
