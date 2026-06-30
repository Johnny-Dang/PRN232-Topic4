using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database
{
    public interface IApplicationDbContext
    {
        public DbSet<AdvancementRules> AdvancementRules { get; set; }
        public DbSet<AuditLogs> AuditLogs { get; set; }
        public DbSet<Categories> Categories { get; set; }
        public DbSet<CategoryMentors> CategoryMentors { get; set; }
        public DbSet<Criteria> Criterias { get; set; }
        public DbSet<Eliminations> Eliminations { get; set; }
        public DbSet<EventCriteria> EventCriteria { get; set; }
        public DbSet<Events> Events { get; set; }
        public DbSet<JudgeAssignments> JudgeAssignments { get; set; }
        public DbSet<Rankings> Rankings { get; set; }
        public DbSet<Rounds> Rounds { get; set; }
        public DbSet<Scores> Scores { get; set; }
        public DbSet<StudentProfiles> StudentProfiles { get; set; }
        public DbSet<Submissions> Submissions { get; set; }
        public DbSet<SubmissionTemplates> SubmissionTemplates { get; set; }
        public DbSet<TeamMembers> TeamMembers { get; set; }
        public DbSet<Teams> Teams { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<Notifications> Notifications { get; set; }

        DbSet<T> Set<T>()
            where T : class;

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
