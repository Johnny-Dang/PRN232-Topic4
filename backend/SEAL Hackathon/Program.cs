using BusinessLogicLayer.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using SEAL_Hackathon.Middlewares;

namespace SEAL_Hackathon
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddService(builder.Configuration);
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddAuthorization(options =>
            {
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();

                options.AddPolicy("CoordinatorOnly", policy => policy.RequireRole("EventCoordinator"));
                options.AddPolicy("JudgeOnly", policy => policy.RequireRole("Judge"));
                options.AddPolicy("MentorOnly", policy => policy.RequireRole("Mentor"));
                options.AddPolicy("TeamLeaderOnly", policy => policy.RequireRole("TeamLeader"));
                options.AddPolicy("TeamMemberOnly", policy => policy.RequireRole("TeamMember"));
                options.AddPolicy("JudgeOrCoordinator", policy => policy.RequireRole("Judge", "EventCoordinator"));
                options.AddPolicy("MentorOrCoordinator", policy => policy.RequireRole("Mentor", "EventCoordinator"));
            });

            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Paste only the JWT token"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseMiddleware<CustomAuthMiddleware>();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
