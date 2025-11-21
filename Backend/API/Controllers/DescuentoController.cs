using Application.DTOs.Requests;
using Application.Exceptions;
using Application.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DescuentoController : ControllerBase
    {
        private readonly IDescuentoService _service;

        public DescuentoController(IDescuentoService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(DescuentoRequest request)
        {
            try
            {
                var descuento = await _service.Add(request);
                return StatusCode(201, descuento);
            }
            catch (ConflictException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var descuentos = await _service.GetAll();

            return Ok(descuentos);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var descuento = await _service.GetById(id);

                return Ok(descuento);
            }

            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, DescuentoRequest request)
        {
            try
            {
                var descuento = await _service.Update(id, request);

                return Ok(descuento);
            }

            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ConflictException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.Delete(id);

                return NoContent();
            }

            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
