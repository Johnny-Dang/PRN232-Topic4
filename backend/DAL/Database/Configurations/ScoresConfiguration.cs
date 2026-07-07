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
    public class ScoresConfiguration : IEntityTypeConfiguration<Scores>
    {
        public void Configure(EntityTypeBuilder<Scores> builder)
        {
            builder.ToTable("Scores");

            builder.HasKey(x => x.ScoreId);

            builder.Property(x => x.ScoreValue)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Comment)
                .HasMaxLength(1000);

            builder.Property(x => x.ScoredAt)
                .HasColumnType("datetime");

            builder.HasIndex(x => new { x.SubmissionId, x.AssignmentId, x.CriteriaId })
                .IsUnique();

            builder.HasOne(x => x.Submission)
                .WithMany(s => s.Scores)
                .HasForeignKey(x => x.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.JudgeAssignment)
                .WithMany() // Assuming JudgeAssignments doesn't have Scores collection based on file view
                .HasForeignKey(x => x.AssignmentId) // Assuming JudgeId maps to AssignmentId or UserId depending on model, Wait JudgeId maps to JudgeAssignments? Let's check Scores.cs: public virtual JudgeAssignments JudgeAssignment { get; set; } and public Guid JudgeId { get; set; }. So JudgeId maps to JudgeAssignment.
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Criteria)
                .WithMany(c => c.Scores)
                .HasForeignKey(x => x.CriteriaId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
