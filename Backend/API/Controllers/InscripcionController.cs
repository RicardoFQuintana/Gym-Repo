using Application.DTOs.Requests;
using Application.Exceptions;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Application.Interfaces.IServices;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InscripcionController : ControllerBase
    {
        private readonly IInscripcionService _service;

        public InscripcionController(IInscripcionService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(InscripcionAddRequest request)
        {
            try
            {
                await _service.Add(request);
                return StatusCode(201);
            }
            catch (NotFoundException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet("by-miembro")]
        public async Task<IActionResult> GetByMiembro(int id)
        {
            var inscripciones = await _service.GetByMiembro(id);
            return Ok(inscripciones);
        }

        [HttpGet("by-clase")]
        public async Task<IActionResult> GetByClase(int id)
        {
            var inscripciones = await _service.GetByClase(id);
            return Ok(inscripciones);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var inscripciones = await _service.GetById(id);
                return Ok(inscripciones);
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
