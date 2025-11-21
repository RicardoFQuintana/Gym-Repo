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
    public class ClaseController : ControllerBase
    {
        private readonly IClaseService _service;

        public ClaseController(IClaseService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> Create(ClaseAddRequest request)
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
            var clases = await _service.GetAll();
            return Ok(clases);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var clase = await _service.GetById(id);
                return Ok(clase);
            }
            catch (NotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(int id, ClaseUpdateRequest request)
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
            catch (ConflictException ex)
            {
                return Conflict(new { message = ex.Message });
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
