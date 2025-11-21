using Application.DTOs.Requests;
using Application.Exceptions;
using Application.Interfaces.IServices;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActividadController : ControllerBase
    {
        private readonly IActividadService _service;

        public ActividadController(IActividadService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(ActividadRequest request)
        {
            var actividad = await _service.Add(request);
            return StatusCode(201, actividad);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var actividades = await _service.GetAll();

            return Ok(actividades);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var actividad = await _service.GetById(id);

                return Ok(actividad);
            }

            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, ActividadRequest request)
        {
            try
            {
                var actividad = await _service.Update(id, request);

                return Ok(actividad);
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
