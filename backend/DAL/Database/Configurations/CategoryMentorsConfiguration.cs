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
    public class CategoryMentorsConfiguration : IEntityTypeConfiguration<CategoryMentors>
    {
        public void Configure(EntityTypeBuilder<CategoryMentors> builder)
        {
            builder.ToTable("CategoryMentors");

            builder.HasKey(x => x.CategoryMentorId);

            builder.HasOne(x => x.Category)
                .WithMany(c => c.CategoryMentors)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.User)
                .WithMany() // Assuming User doesn't have CategoryMentors
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
