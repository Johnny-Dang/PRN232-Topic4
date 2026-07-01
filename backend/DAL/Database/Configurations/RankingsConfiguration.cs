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
    public class RankingsConfiguration : IEntityTypeConfiguration<Rankings>
    {
        public void Configure(EntityTypeBuilder<Rankings> builder)
        {
            builder.ToTable("Rankings");

            builder.HasKey(x => x.RankingId);

            builder.Property(x => x.RankPosition)
                .IsRequired();

            builder.Property(x => x.TotalScore)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.GeneratedAt)
                .HasColumnType("datetime");

            builder.HasIndex(x => new { x.RoundId, x.CategoryId, x.TeamId })
                .IsUnique();

            builder.HasOne(x => x.Team)
                .WithMany(t => t.Rankings)
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Round)
                .WithMany(r => r.Rankings)
                .HasForeignKey(x => x.RoundId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
