using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Requests
{
    public class ReporteFilterRequest
    {
        public DateTime? FechaInicio { get; set; }
        public DateTime? FechaFin { get; set; }

        public int? MiembroId { get; set; }
        public int? ClaseId { get; set; }

        // Para filtrar por tipo de membresía o actividad
        public string? Tipo { get; set; }

        // Ej: "mensual", "anual", "diario" (según el tipo de reporte)
        public string? Periodo { get; set; }
    }
}