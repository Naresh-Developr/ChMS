using System.Reflection;
using api.Extensions;
using ChMS.Modules.Auth;
using Microsoft.Extensions.Options;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
/*
 * This is the standard, recommended approach for adding controller modules in modular monoliths
 
 * AuthModule is a class inside the Auth module (AuthModule.cs)
 * typeof(AuthModule) gets the System.Type object representing that class
 * .Assembly gets the System.Reflection.Assembly containing that AuthModule that is Evently.Modules.Auth.dll
  
 * To put it plainly, .AddControllers() alone finds controllers in the main assembly
 * .AddApplicationPart(typeof(AuthModule).Assembly) tells it to also search in Evently.Modules.Auth.dll
 */
builder.Services.AddControllers().AddApplicationPart(typeof(AuthModule).Assembly);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddAuthModule(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
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

app.UseAuthorization();

app.MapControllers();

app.Run();
