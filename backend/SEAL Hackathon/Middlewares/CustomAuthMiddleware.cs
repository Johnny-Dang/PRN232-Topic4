using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SEAL_Hackathon.Middlewares
{
    public class CustomAuthMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public CustomAuthMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string? token = null;
            var authHeader = context.Request.Headers.Authorization.FirstOrDefault();

            if (
                !string.IsNullOrWhiteSpace(authHeader)
                && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            )
            {
                token = authHeader["Bearer ".Length..].Trim();
            }
            else if (context.Request.Query.TryGetValue("access_token", out var queryToken))
            {
                token = queryToken.FirstOrDefault();
            }

            if (!string.IsNullOrWhiteSpace(token))
            {
                try
                {
                    var jwt = _configuration.GetSection("Jwt");
                    var secret =
                        jwt.GetValue<string>("Secret")
                        ?? throw new InvalidOperationException("JWT Secret is not configured.");
                    var issuer =
                        jwt.GetValue<string>("Issuer")
                        ?? throw new InvalidOperationException("JWT Issuer is not configured.");
                    var audience =
                        jwt.GetValue<string>("Audience")
                        ?? throw new InvalidOperationException("JWT Audience is not configured.");

                    var tokenHandler = new JwtSecurityTokenHandler();
                    var validationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                        ValidateIssuer = true,
                        ValidIssuer = issuer,
                        ValidateAudience = true,
                        ValidAudience = audience,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,
                        NameClaimType = ClaimTypes.Name,
                        RoleClaimType = ClaimTypes.Role,
                    };

                    var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                    context.User = principal;
                    context.Items["Email"] = principal.FindFirstValue(ClaimTypes.Email);
                    context.Items["Phone"] = principal.FindFirstValue(ClaimTypes.MobilePhone);
                }
                catch
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("Invalid or expired token.");
                    return;
                }
            }

            await _next(context);
        }
    }
}
