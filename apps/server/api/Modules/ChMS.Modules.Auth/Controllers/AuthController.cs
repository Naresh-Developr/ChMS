using ChMS.Modules.Auth.Application.Services;
using ChMS.Modules.Auth.Core.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace ChMS.Modules.Auth.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(AuthService authService) : ControllerBase
    {
        private readonly AuthService _auth = authService;

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(SignUpRequest signUpRequest)
        {
            var userId = await _auth.Signup(signUpRequest);
            return Ok(new { id = userId.ToString() });
        }

        [HttpPost("signin")]
        public async Task<IActionResult> Signin(LoginRequest req)
        {
            var token = await _auth.Signin(req.Email, req.Password);
            return Ok(new { token });
        }

        [HttpGet("test")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> testApi()
        {
            var message = "got it";
            return Ok(new { message });
        }
    }
}
