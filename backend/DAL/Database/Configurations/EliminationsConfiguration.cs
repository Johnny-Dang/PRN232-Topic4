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
    public class EliminationsConfiguration : IEntityTypeConfiguration<Eliminations>
    {
        public void Configure(EntityTypeBuilder<Eliminations> builder)
        {
            builder.ToTable("Eliminations");

            builder.HasKey(x => x.EliminationId);

            builder.Property(x => x.Reason)
                .HasMaxLength(1000);

            builder.Property(x => x.EliminatedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.Submission)
                .WithMany(s => s.Eliminations)
                .HasForeignKey(x => x.SubmissionId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.User)
                .WithMany() // Assuming User doesn't have an Eliminations collection
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
