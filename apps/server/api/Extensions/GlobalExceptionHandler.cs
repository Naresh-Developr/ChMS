using System.Net;
using System.Text.Json;
using EZXception.Data;
using Microsoft.AspNetCore.Diagnostics;

namespace api.Extensions
{
    public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
    {
        private readonly ILogger _logger = logger;

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
                case DuplicateEntityException duplicateEntityException:
                    statusCode = HttpStatusCode.Conflict;
                    message = duplicateEntityException.Message;
                    logLevel = LogLevel.Warning;
                    break;

                case EntityNotFoundException entityNotFound:
                    statusCode = HttpStatusCode.NotFound;
                    message = entityNotFound.Message;
                    logLevel = LogLevel.Warning;
                    break;

                default:
                    message = $"Unhandled exception occurred!";
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

            _logger.Log(
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
