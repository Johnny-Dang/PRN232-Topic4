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
    public class AdvancementRulesConfiguration : IEntityTypeConfiguration<AdvancementRules>
    {
        public void Configure(EntityTypeBuilder<AdvancementRules> builder)
        {
            builder.ToTable("AdvancementRules");

            builder.HasKey(x => x.RuleId);

            builder.Property(x => x.TopN)
                .IsRequired();

            builder.HasIndex(x => new { x.RoundId, x.CategoryId })
                .IsUnique();

            builder.HasOne(x => x.Round)
                .WithMany(r => r.AdvancementRules)
                .HasForeignKey(x => x.RoundId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Category)
                .WithMany(c => c.AdvancementRules)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
