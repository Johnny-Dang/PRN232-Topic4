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
    public class CalibrationScoresConfiguration : IEntityTypeConfiguration<CalibrationScores>
    {
        public void Configure(EntityTypeBuilder<CalibrationScores> builder)
        {
            builder.ToTable("CalibrationScores");

            builder.HasKey(x => x.CalibrationId);

            builder.Property(x => x.ScoreValue)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Comment)
                .HasMaxLength(1000);

            builder.Property(x => x.ScoredAt)
                .HasColumnType("datetime");

            builder.HasIndex(x => new { x.SubmissionId, x.JudgeId, x.CriteriaId })
                .IsUnique();

            builder.HasOne(x => x.Judge)
                .WithMany() // Assuming User doesn't have a specific collection for CalibrationScores
                .HasForeignKey(x => x.JudgeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Criteria)
                .WithMany(c => c.CalibrationScores)
                .HasForeignKey(x => x.CriteriaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Submission)
                .WithMany(s => s.CalibrationScores)
                .HasForeignKey(x => x.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
