using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class ClaseResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public int InscriptosCount { get; set; }
        public int Cupo { get; set; }
        public DayOfWeek Dia { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan HoraFin { get; set; }
        public int EntrenadorId { get; set; }
        public string EntrenadorNombre { get; set; }
        public string EntrenadorApellido { get; set; }
        public string ActividadNombre { get; set; }
        public ICollection<InscripcionSummaryResponse> Inscripciones { get; set; }
    }
}
