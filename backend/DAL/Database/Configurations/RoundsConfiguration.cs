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
    public class RoundsConfiguration : IEntityTypeConfiguration<Rounds>
    {
        public void Configure(EntityTypeBuilder<Rounds> builder)
        {
            builder.ToTable("Rounds");

            builder.HasKey(x => x.RoundId);

            builder.Property(x => x.RoundName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.RoundOrder)
                .IsRequired();

            builder.Property(x => x.SubmissionDeadline)
                .HasColumnType("datetime");

            builder.Property(x => x.StartDate)
                .HasColumnType("datetime");

            builder.Property(x => x.EndDate)
                .HasColumnType("datetime");

            builder.Property(x => x.IsFinalized)
                .HasDefaultValue(false)
                .IsRequired();

            builder.Property(x => x.FinalizedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.Event)
                .WithMany(e => e.Rounds)
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
