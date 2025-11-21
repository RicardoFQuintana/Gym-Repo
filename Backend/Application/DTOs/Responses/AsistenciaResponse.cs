using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class AsistenciaResponse
    {
        public int Id { get; set; }
        public int MiembroId { get; set; }
        public string MiembroNombre { get; set; }
        public string MiembroApellido { get; set; }
        public int? ClaseId { get; set; }
        public string ClaseNombre { get; set; }
        public DateTime Fecha { get; set; }

    }
}
