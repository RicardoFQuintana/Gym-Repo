using Application.Interfaces.IServices;
using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;
using Microsoft.AspNetCore.Mvc;
using Application.DTOs.Responses;
using Application.DTOs.Requests;


namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReporteController : ControllerBase
    {
        private readonly IReporteService _service;

        public ReporteController(IReporteService service)
        {
            _service = service;
        }

        // GET => /api/Reporte/ingresos
        [HttpGet("ingresos")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ReporteIngresos([FromQuery] ReporteFilterRequest filter)
        {
            try
            {
                if (filter == null)
                    return BadRequest(new ApiError { message = "Debe especificar un filtro de reporte." });

                if (filter.FechaInicio.HasValue && filter.FechaFin.HasValue && filter.FechaInicio > filter.FechaFin)
                    return BadRequest(new ApiError { message = "La fecha de inicio no puede ser mayor que la fecha fin." });

                var data = await _service.ReporteIngresosData(filter);

                if (data == null || data.Registros == null || data.Registros.Count == 0)
                    return NotFound(new ApiError { message = "No se encontraron ingresos en el período especificado." });

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError { message = $"Error al obtener el reporte de ingresos: {ex.Message}" });
            }
        }

        // GET => /api/Reporte/asistencia
        [HttpGet("asistencia")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ReporteAsistencia([FromQuery] ReporteFilterRequest filter)
        {
            try
            {
                var data = await _service.ReporteAsistenciaData(filter);

                if (data == null || data.Registros.Count == 0)
                    return NotFound(new ApiError { message = "No se encontraron registros de asistencia en el período indicado." });

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError { message = $"Error al obtener el reporte de asistencia: {ex.Message}" });
            }
        }

        // GET => /api/Reporte/financieros
        [HttpGet("financieros")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ReporteFinanciero([FromQuery] ReporteFilterRequest filter)
        {
            try
            {
                if (filter == null)
                    return BadRequest(new ApiError { message = "Debe indicar un filtro de búsqueda." });

                if (string.IsNullOrEmpty(filter.Periodo))
                    filter.Periodo = "mensual"; // valor por defecto

                var data = await _service.ReporteFinancieroData(filter);

                if (data == null || data.Detalle == null || !data.Detalle.Any())
                    return NotFound(new ApiError { message = "No se encontraron movimientos financieros en el período indicado." });

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiError { message = $"Error al obtener el reporte financiero: {ex.Message}" });
            }
        }
    }
}