using Application.DTOs.Requests;
using Application.Exceptions;
using Application.Interfaces.IServices;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EntrenadorController : ControllerBase
    {
        private readonly IEntrenadorService _service;

        public EntrenadorController(IEntrenadorService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(EntrenadorAddRequest request)
        {
            try
            {
                await _service.Add(request);
                return StatusCode(201);
            }
            catch (ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var entrenadores = await _service.GetAll();

            return Ok(entrenadores);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var entrenador = await _service.GetById(id);
                return Ok(entrenador);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, EntrenadorUpdateRequest request)
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
