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
    public class TeamsConfiguration : IEntityTypeConfiguration<Teams>
    {
        public void Configure(EntityTypeBuilder<Teams> builder)
        {
            builder.ToTable("Teams");

            builder.HasKey(x => x.TeamId);

            builder.Property(x => x.TeamName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.TeamStatus)
                .HasMaxLength(50);

            builder.HasOne(x => x.TeamLeader)
                .WithMany()
                .HasForeignKey(x => x.TeamLeaderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Category)
                .WithMany(c => c.Teams)
                .HasForeignKey(x => x.CategoryId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
