using Bathra.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Bathra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StartupController : ControllerBase
    {
        private readonly IStartupService _startupService;

        public StartupController(IStartupService startupService)
        {
            _startupService = startupService;
        }

        [HttpGet("getAllStartups")]
        public async Task<IActionResult> GetAllStartups()
        {
            var startups = await _startupService.GetAllStartupsAsync();
            return Ok(startups);
        }
    }
}
