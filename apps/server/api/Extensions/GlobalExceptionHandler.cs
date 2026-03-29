using System.ComponentModel.DataAnnotations;
using System.Net;
using EZXception.Data;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace api.Extensions
{
    public class GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IProblemDetailsService problemDetailsService,
        IHostEnvironment env
    ) : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken
        )
        {
            if (exception is OperationCanceledException)
                return true;

            var statusCode = HttpStatusCode.InternalServerError;
            var logLevel = LogLevel.Error;
            string message;

            switch (exception)
            {
                case DuplicateEntityException ex:
                    statusCode = HttpStatusCode.Conflict;
                    logLevel = LogLevel.Warning;
                    message = ex.Message;
                    break;

                case EntityNotFoundException ex:
                    statusCode = HttpStatusCode.NotFound;
                    logLevel = LogLevel.Warning;
                    message = ex.Message;
                    break;

                case ValidationException ex:
                    statusCode = HttpStatusCode.BadRequest;
                    logLevel = LogLevel.Warning;
                    message = ex.Message;
                    break;

                case InvalidCastException ex:
                    statusCode = HttpStatusCode.Unauthorized;
                    logLevel = LogLevel.Warning;
                    message = ex.Message;
                    break;

                default:
                    message = env.IsDevelopment() ? exception.Message : "An unexpected error occurred.";
                    break;
            }

            logger.Log(
                logLevel,
                exception,
                "Method: {Method}, Path: {Path}, ExceptionMessage: {Message}, TraceId: {TraceId}",
                httpContext.Request.Method,
                httpContext.Request.Path,
                message,
                httpContext.TraceIdentifier
            );

            httpContext.Response.StatusCode = (int)statusCode;

            await problemDetailsService.WriteAsync(
                new ProblemDetailsContext
                {
                    HttpContext = httpContext,
                    Exception = exception,
                    ProblemDetails = new ProblemDetails
                    {
                        Status = (int)statusCode,
                        Title = message,
                        Extensions = { ["traceId"] = httpContext.TraceIdentifier },
                    },
                }
            );

            return true;
        }
    }
}
