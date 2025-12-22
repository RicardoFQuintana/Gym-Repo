using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Interfaces.IServices;
using Application.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PagoController : ControllerBase
    {
        private readonly IPagoService _service;

        public PagoController(IPagoService service)
        {
            _service = service;
        }

        // POST => /api/Pago
        [HttpPost]
        public async Task<IActionResult> RegistrarPago([FromBody] PagoRequest request)
        {
            if (request == null)
                return BadRequest(new ApiError { message = "Datos inválidos" });

            if (request.Monto <= 0)
                return BadRequest(new ApiError { message = "Monto inválido" });

            try
            {
                var pago = await _service.Add(request);
                return StatusCode(201, pago);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new ApiError { message = ex.Message });
            }
            catch (BadRequestException ex)
            {
                return BadRequest(new ApiError { message = ex.Message });
            }
        }

        // GET => /api/Pago
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var pagos = await _service.GetAll();
                // Si no hay resultados, devolvemos una lista vacía en vez de NotFound
                return Ok(pagos ?? new List<PagoResponse>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError { message = $"Error inesperado al obtener los pagos: {ex.Message}" });
            }
        }
    }
}