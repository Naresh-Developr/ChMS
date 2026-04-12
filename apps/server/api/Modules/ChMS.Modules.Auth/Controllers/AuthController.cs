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
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = await _auth.Signup(signUpRequest);
            return CreatedAtAction(
                actionName: "GetUserById",
                controllerName: "User",
                routeValues: new { id = userId },
                value: new { id = userId }
            );
        }

        [HttpPost("signin")]
        public async Task<IActionResult> Signin(LoginRequest req)
        {
            SignInResponse res = await _auth.Signin(req.Email, req.Password);
            return Ok(res);
        }
    }
}
