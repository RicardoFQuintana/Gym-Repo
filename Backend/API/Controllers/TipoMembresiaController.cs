using Application.DTOs.Requests;
using Application.Exceptions;
using Application.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TipoMembresiaController : ControllerBase
    {
        private readonly ITipoMembresiaService _service;

        public TipoMembresiaController(ITipoMembresiaService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(TipoMembresiaRequest request)
        {
            var tipoMembresia = await _service.Add(request);

            return StatusCode(201, tipoMembresia);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tipoMembresias = await _service.GetAll();

            return Ok(tipoMembresias);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var tipoMembresia = await _service.GetById(id);

                return Ok(tipoMembresia);
            }

            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, TipoMembresiaRequest request)
        {
            try
            {
                var tipoMembresia = await _service.Update(id, request);

                return Ok(tipoMembresia);
            }

            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
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
