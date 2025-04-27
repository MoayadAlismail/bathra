using Bathra.Application.DTOs;
using Bathra.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace Bathra.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto userDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed",
                    errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList()
                });

            var result = await _userService.RegisterUserAsync(userDto);

            if (result)
                return Ok(new
                {
                    success = true,
                    message = "User registered successfully"
                    //data = new { userId =  }
                });
            else
                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while registering the user",
                    error = "User registration failed" // Include more specific error if available
                });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto userDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userService.LoginUserAsync(userDto);
            if (result.ResponseCode == HttpStatusCode.OK)
                return Ok(result);
            else
                return Unauthorized("Invalid email or password.");
        }

    }
}
