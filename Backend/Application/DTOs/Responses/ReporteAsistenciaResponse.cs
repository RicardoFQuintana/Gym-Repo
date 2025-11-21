using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class ReporteAsistenciaResponse
    {
        public string Periodo { get; set; }
        public List<ReporteRegistro> Registros { get; set; } = new();
    }
}
