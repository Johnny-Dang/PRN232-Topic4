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
    public class CriteriaConfiguration : IEntityTypeConfiguration<Criteria>
    {
        public void Configure(EntityTypeBuilder<Criteria> builder)
        {
            builder.ToTable("Criteria");

            builder.HasKey(x => x.CriteriaId);

            builder.Property(x => x.CriteriaName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.Weight)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.HasOne(x => x.Template)
                .WithMany(t => t.Criteria)
                .HasForeignKey(x => x.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
