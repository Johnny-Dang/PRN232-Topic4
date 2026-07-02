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
    public class EventCriteriaConfiguration : IEntityTypeConfiguration<EventCriteria>
    {
        public void Configure(EntityTypeBuilder<EventCriteria> builder)
        {
            builder.ToTable("EventCriteria");

            builder.HasKey(x => x.EventCriteriaId);

            builder.Property(x => x.Weight)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.HasIndex(x => new { x.EventId, x.CriteriaId })
                .IsUnique();

            builder.HasOne(x => x.Criteria)
                .WithMany(c => c.EventCriteria)
                .HasForeignKey(x => x.CriteriaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Event)
                .WithMany(e => e.EventCriteria) // Assuming Events has EventCriteria
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
