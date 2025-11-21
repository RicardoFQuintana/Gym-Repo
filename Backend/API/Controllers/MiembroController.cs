using Application.DTOs.Requests;
using Application.Interfaces.IServices;
using Application.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MiembroController : ControllerBase
    {
        private readonly IMiembroService _service;

        public MiembroController(IMiembroService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MiembroAddRequest request)
        {
            try
            {
                var miembro = await _service.Add(request);
                return StatusCode(201, miembro);
            }

            catch(ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var miembros = await _service.GetAll();
            return Ok(miembros);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var miembro = await _service.GetById(id);
                return Ok(miembro);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }

        }

        [HttpPatch("{id}")]

        public async Task<IActionResult> Update(int id, [FromBody] MiembroUpdateRequest request)
        {
            
            try
            {
                var miembro = await _service.Update(id, request);
                
                return Ok(miembro);
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
        [HttpPut("asignar-entrenador")]
        public async Task<IActionResult> AsignarEntrenador(int miembroId, int entrenadorId)
        {
            try
            {
                await _service.AsignarEntrenador(miembroId, entrenadorId);
                return Ok();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
