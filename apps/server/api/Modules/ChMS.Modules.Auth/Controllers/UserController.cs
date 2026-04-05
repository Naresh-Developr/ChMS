using System;
using System.Collections.Generic;
using System.Text;
using ChMS.Modules.Auth.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChMS.Modules.Auth.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/user")]
    public class UserController(UserService userService) : ControllerBase
    {
        private readonly UserService _userService = userService;

        [Authorize(Roles = "Admin, SuperAdmin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            var user = await _userService.GetUserById(id);
            return user == null ? NotFound() : Ok(user);
        }
    }
}
