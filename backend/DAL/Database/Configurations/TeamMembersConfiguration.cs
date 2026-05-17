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
    public class TeamMembersConfiguration : IEntityTypeConfiguration<TeamMembers>
    {
        public void Configure(EntityTypeBuilder<TeamMembers> builder)
        {
            builder.ToTable("TeamMembers");

            builder.HasKey(x => x.TeamMemberId);

            builder.Property(x => x.JoinDate)
                .HasColumnType("datetime");

            builder.HasOne(x => x.User)
                .WithMany(u => u.TeamMembers)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Team)
                .WithMany(t => t.TeamMembers)
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
