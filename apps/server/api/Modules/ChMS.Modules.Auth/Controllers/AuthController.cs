using ChMS.Modules.Auth.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace ChMS.Modules.Auth.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;

        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest req)
        {
            var token = await _auth.Register("temp", req.Email, req.Password);
            return Ok(new { token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest req)
        {
            var token = await _auth.Login(req.Email, req.Password);
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
