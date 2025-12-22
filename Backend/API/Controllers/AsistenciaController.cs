using Application.DTOs.Requests;
using Application.Interfaces.IServices;
using Application.Exceptions;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsistenciaController : ControllerBase
    {
        private readonly IAsistenciaService _service;

        public AsistenciaController(IAsistenciaService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(AsistenciaAddRequest request)
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
            catch (ArgumentOutOfRangeException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var asistencias = await _service.GetAll();
            return Ok(asistencias);
        }

        [HttpGet("by-miembro")]
        public async Task<IActionResult> GetByMiembro(int id)
        {
            var asistencias = await _service.GetByMiembro(id);
            return Ok(asistencias);
        }

        [HttpGet("by-clase")]
        public async Task<IActionResult> GetByClase(int id)
        {
            var asistencias = await _service.GetByClase(id);
            return Ok(asistencias);
        }

        [HttpGet("by-clase-fecha")]
        public async Task<IActionResult> GetByClaseYFecha(int id, DateTime fecha)
        {
            var asistencias = await _service.GetByClaseYFecha(id, fecha);
            return Ok(asistencias);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var asistencia = await _service.GetById(id);
                return Ok(asistencia);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] AsistenciaUpdateRequest request)
        {
            try
            {
                await _service.Update(id, request);
                return Ok();
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpDelete]
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
