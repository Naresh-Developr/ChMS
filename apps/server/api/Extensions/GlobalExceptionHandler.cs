using System.Net;
using System.Text.Json;
using EZXception.Data;
using Microsoft.AspNetCore.Diagnostics;

namespace api.Extensions
{
    public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken
        )
        {
            var statusCode = HttpStatusCode.InternalServerError;
            var logLevel = LogLevel.Error;
            string? message;

            switch (exception)
            {
                case DuplicateEntityException dee:
                    statusCode = HttpStatusCode.Conflict;
                    message = dee.Message;
                    logLevel = LogLevel.Warning;
                    break;

                default:
                    message = $"Unhandled exception occured!";
                    break;
            }

            httpContext.Response.ContentType = "application/json";
            httpContext.Response.StatusCode = (int)statusCode;

            var res = new { statusCode, error = message };

            await httpContext.Response.WriteAsync(
                JsonSerializer.Serialize(
                    res,
                    new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }
                ),
                cancellationToken: cancellationToken
            );

            logger.Log(
                logLevel,
                exception,
                "Method: {Method}, Path: {Path}, TraceId: {TraceId}, Error: {ErrorMessage}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                httpContext.TraceIdentifier,
                message
            );

            return true;
        }
    }
}
