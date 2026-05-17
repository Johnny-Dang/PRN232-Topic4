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
    public class UserConfiguration : IEntityTypeConfiguration<Users>
    {
        public void Configure(EntityTypeBuilder<Users> builder)
        {
            builder.ToTable("Users");

            builder.HasKey(x => x.UserId);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(255);

            builder.HasIndex(x => x.Email)
                .IsUnique();

            builder.Property(x => x.Password)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(x => x.FullName)
                .HasMaxLength(255);

            builder.Property(x => x.Phone)
                .HasMaxLength(30);

            builder.Property(x => x.Role)
                .HasMaxLength(50);

            builder.Property(x => x.AccountStatus)
                .HasMaxLength(50);

            builder.Property(x => x.CreatedAt)
                .HasColumnType("datetime");

            builder.HasMany(x => x.TeamMembers)
                .WithOne(x => x.User)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
