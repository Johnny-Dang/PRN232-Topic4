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
    public class StudentProfilesConfiguration : IEntityTypeConfiguration<StudentProfiles>
    {
        public void Configure(EntityTypeBuilder<StudentProfiles> builder)
        {
            builder.ToTable("StudentProfiles");

            builder.HasKey(x => x.ProfileId);

            builder.Property(x => x.StudentType)
                .HasMaxLength(100);

            builder.Property(x => x.StudentCode)
                .HasMaxLength(100);

            builder.Property(x => x.UniversityName)
                .HasMaxLength(255);

            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
