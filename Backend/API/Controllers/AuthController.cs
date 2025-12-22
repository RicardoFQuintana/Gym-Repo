using Application.Interfaces.IServices;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs.Requests;

namespace API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ILoginService _loginService;

        public AuthController(ILoginService loginService)
        {
            _loginService = loginService;
        }

        [HttpPost("login")]
        public IActionResult Login(LoginRequest request)
        {
            try
            {
                var empleado = _loginService.Login(
                    request.Usuario,
                    request.Password
                );

                return Ok(new
                {
                    empleado.Id,
                    empleado.Usuario,
                    empleado.Rol
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
        }
    }
}