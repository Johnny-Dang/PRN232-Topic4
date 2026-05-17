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
    public class AuditLogsConfiguration : IEntityTypeConfiguration<AuditLogs>
    {
        public void Configure(EntityTypeBuilder<AuditLogs> builder)
        {
            builder.ToTable("AuditLogs");

            builder.HasKey(x => x.LogId);

            builder.Property(x => x.ActionType)
                .HasMaxLength(255);

            builder.Property(x => x.OldValue)
                .HasColumnType("nvarchar(max)");

            builder.Property(x => x.NewValue)
                .HasColumnType("nvarchar(max)");

            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime");

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
