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
    public class JudgeAssignmentsConfiguration : IEntityTypeConfiguration<JudgeAssignments>
    {
        public void Configure(EntityTypeBuilder<JudgeAssignments> builder)
        {
            builder.ToTable("JudgeAssignments");

            builder.HasKey(x => x.AssignmentId);

            builder.HasIndex(x => new { x.UserId, x.RoundId })
                .IsUnique();

            builder.HasOne(x => x.User)
                .WithMany() // Assuming Users don't have JudgeAssignments collection
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Round)
                .WithMany(r => r.JudgeAssignments)
                .HasForeignKey(x => x.RoundId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
