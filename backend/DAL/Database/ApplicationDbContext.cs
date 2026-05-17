using DataAccessLayer.Database.Configurations;
using DataAccessLayer.Database.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

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
        public new DbSet<T> Set<T>()
            where T : class => base.Set<T>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfiguration<AdvancementRules>(new AdvancementRulesConfiguration());
            modelBuilder.ApplyConfiguration<AuditLogs>(new AuditLogsConfiguration());
            modelBuilder.ApplyConfiguration<CalibrationScores>(new CalibrationScoresConfiguration());
            modelBuilder.ApplyConfiguration<Categories>(new CategoriesConfiguration());
            modelBuilder.ApplyConfiguration<CategoryMentors>(new CategoryMentorsConfiguration());
            modelBuilder.ApplyConfiguration<Criteria>(new CriteriaConfiguration());
            modelBuilder.ApplyConfiguration<Eliminations>(new EliminationsConfiguration());
            modelBuilder.ApplyConfiguration<EventCriteria>(new EventCriteriaConfiguration());
            modelBuilder.ApplyConfiguration<Events>(new EventsConfiguration());
            modelBuilder.ApplyConfiguration<JudgeAssignments>(new JudgeAssignmentsConfiguration());
            modelBuilder.ApplyConfiguration<Rankings>(new RankingsConfiguration());
            modelBuilder.ApplyConfiguration<Rounds>(new RoundsConfiguration());
            modelBuilder.ApplyConfiguration<Scores>(new ScoresConfiguration());
            modelBuilder.ApplyConfiguration<StudentProfiles>(new StudentProfilesConfiguration());
            modelBuilder.ApplyConfiguration<Submissions>(new SubmissionsConfiguration());
            modelBuilder.ApplyConfiguration<SubmissionTemplates>(new SubmissionTemplatesConfiguration());
            modelBuilder.ApplyConfiguration<TeamMembers>(new TeamMembersConfiguration());
            modelBuilder.ApplyConfiguration<Teams>(new TeamsConfiguration());
            modelBuilder.ApplyConfiguration<Users>(new UserConfiguration());
            
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
