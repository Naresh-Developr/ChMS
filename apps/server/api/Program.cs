using System.Reflection;
using api.Extensions;
using ChMS.Modules.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using Microsoft.AspNetCore.Mvc.ApplicationParts;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
/*
 * This is the standard, recommended approach for adding module controllers in modular monoliths
 
 * AuthModule is a class inside the Auth module (AuthModule.cs)
 * typeof(AuthModule) gets the System.Type object representing that class
 * .Assembly gets the System.Reflection.Assembly containing that AuthModule that is Evently.Modules.Auth.dll
  
 * To put it plainly, .AddControllers() alone finds controllers in the main assembly
 * .AddApplicationPart(typeof(AuthModule).Assembly) tells it to also search in Evently.Modules.Auth.dll
 */
builder.Services.AddControllers()
    .ConfigureApplicationPartManager(manager =>
    {
        manager.ApplicationParts.Add(
            new AssemblyPart(typeof(AuthModule).Assembly)
        );
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddAuthModule(builder.Configuration);

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var config = builder.Configuration;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = config["Jwt:Issuer"],
            ValidAudience = config["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Secret"]!)
            )
        };
    });

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("ChMS Server")
            .WithTheme(ScalarTheme.Moon)
            .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });

    app.RunMigrations();
}
else
{
    app.UseHttpsRedirection();
}

app.MapControllers();

app.Run();