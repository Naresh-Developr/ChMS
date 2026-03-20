using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    public readonly AppDbContext _dbContext;

    public AuthController(AppDbContext dbContext) {
      _dbContext = dbContext;
    }

    [HttpPost]
    public ActionResult createUser([FromBody] User user)
    {
      if (user == null)
      {
        return NoContent();
      }
      _dbContext.Add(user);
      return Ok(_dbContext.SaveChanges());
    }
  }
}
