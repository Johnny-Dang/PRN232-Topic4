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
    public class SubmissionsConfiguration : IEntityTypeConfiguration<Submissions>
    {
        public void Configure(EntityTypeBuilder<Submissions> builder)
        {
            builder.ToTable("Submissions");

            builder.HasKey(x => x.SubmissionId);

            builder.Property(x => x.RepositoryURL)
                .HasMaxLength(2000);

            builder.Property(x => x.DemoURL)
                .HasMaxLength(2000);

            builder.Property(x => x.SlideURL)
                .HasMaxLength(2000);

            builder.Property(x => x.Status)
                .HasMaxLength(50);

            builder.Property(x => x.IsCalibrationSample)
                .HasDefaultValue(false);

            builder.Property(x => x.CalibrationTitle)
                .HasMaxLength(255);

            builder.Property(x => x.SubmittedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.Team)
                .WithMany(t => t.Submissions)
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Round)
                .WithMany(r => r.Submissions)
                .HasForeignKey(x => x.RoundId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
