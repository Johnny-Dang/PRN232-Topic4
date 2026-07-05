using BusinessLogicLayer.Extensions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using SEAL_Hackathon.Authentication;
using SEAL_Hackathon.Middlewares;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using BusinessLogicLayer.Services.Interfaces;
using SEALHackathonSystem.Services;
using SEALHackathonSystem.Hubs;

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
            builder.Services.AddSignalR();
            builder.Services.AddScoped<INotificationSender, NotificationSender>();
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            var jwt = builder.Configuration.GetSection("Jwt");
            var secret = jwt["Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured.");
            var issuer = jwt["Issuer"] ?? "seal";
            var audience = jwt["Audience"] ?? "seal_audience";

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = CustomJwtAuthenticationHandler.SchemeName;
                options.DefaultChallengeScheme = CustomJwtAuthenticationHandler.SchemeName;
                options.DefaultForbidScheme = CustomJwtAuthenticationHandler.SchemeName;
            })
            .AddScheme<AuthenticationSchemeOptions, CustomJwtAuthenticationHandler>(
                CustomJwtAuthenticationHandler.SchemeName, _ => { });

            builder.Services.AddAuthorization(options =>
            {
                options.FallbackPolicy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();

                options.AddPolicy("CoordinatorOnly", policy => policy.RequireRole("Coordinator", "EventCoordinator"));
                options.AddPolicy("JudgeOnly", policy => policy.RequireRole("Judge"));
                options.AddPolicy("MentorOnly", policy => policy.RequireRole("Mentor"));
                options.AddPolicy("TeamLeaderOnly", policy => policy.RequireRole("TeamLeader"));
                options.AddPolicy("TeamMemberOnly", policy => policy.RequireRole("TeamMember"));
                options.AddPolicy("JudgeOrCoordinator", policy => policy.RequireRole("Judge", "Coordinator", "EventCoordinator"));
                options.AddPolicy("MentorOrCoordinator", policy => policy.RequireRole("Mentor", "Coordinator", "EventCoordinator"));
                options.AddPolicy("CalibrationViewer", policy => policy.RequireRole("Judge", "Coordinator", "EventCoordinator", "Researcher"));
                options.AddPolicy("ResearcherOrCoordinator", policy => policy.RequireRole("Researcher", "Coordinator", "EventCoordinator"));
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

            app.Logger.LogInformation("JWT Secret loaded: {Secret}", secret);
            app.Logger.LogInformation("JWT Issuer loaded: {Issuer}", issuer);

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAll");
            if (!app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }
            app.UseAuthentication();
            app.UseMiddleware<CustomAuthMiddleware>();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<NotificationHub>("/notificationHub");

            app.Run();
        }
    }
}
