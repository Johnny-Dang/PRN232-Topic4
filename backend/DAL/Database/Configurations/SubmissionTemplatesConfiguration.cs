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
    public class SubmissionTemplatesConfiguration : IEntityTypeConfiguration<SubmissionTemplates>
    {
        public void Configure(EntityTypeBuilder<SubmissionTemplates> builder)
        {
            builder.ToTable("SubmissionTemplates");

            builder.HasKey(x => x.TemplateId);

            builder.Property(x => x.TemplateName)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.Description)
                .HasMaxLength(1000);
        }
    }
}
