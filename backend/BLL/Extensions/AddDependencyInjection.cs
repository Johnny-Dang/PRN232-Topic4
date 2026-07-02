using BusinessLogicLayer.Services.Implements;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Database;
using DataAccessLayer.Repositories;
using DataAccessLayer.Repositories.Implementations;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Extensions
{
    public static class AddDependencyInjection
    {
        public static void AddService(this IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly("DataAccessLayer"))
            );

            serviceCollection.AddScoped<IApplicationDbContext>(sp =>
                sp.GetRequiredService<ApplicationDbContext>()
            );
            serviceCollection.AddScoped<IUnitOfWork, UnitOfWork>();

            // Register repositories
            serviceCollection.AddScoped<IEventRepository, EventRepository>();
            serviceCollection.AddScoped<IRoundRepository, RoundRepository>();

            // Register services
            serviceCollection.AddScoped<IEventService, EventService>();
            serviceCollection.AddScoped<IRoundService, RoundService>();
            serviceCollection.AddScoped<ICategoryService, CategoryService>();
            serviceCollection.AddScoped<ICategoryMentorService, CategoryMentorService>();
            serviceCollection.AddScoped<IAdvancementRuleService, AdvancementRuleService>();
            serviceCollection.AddScoped<IUserService, UserService>();
            serviceCollection.AddScoped<ITeamService, TeamService>();
            serviceCollection.AddScoped<IRoundService, RoundService>();
            serviceCollection.AddScoped<ISubmissionService, SubmissionService>();
            serviceCollection.AddScoped<IScoresService, ScoresService>();
            serviceCollection.AddScoped<IJudgeAssignmentService, JudgeAssignmentService>();
            serviceCollection.AddScoped<INotificationService, NotificationService>();
            serviceCollection.AddScoped<IRankingService, RankingService>();
            serviceCollection.AddScoped<IEventCriteriaService, EventCriteriaService>();
        }
    }
}
