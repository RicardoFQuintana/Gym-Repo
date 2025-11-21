using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class ReporteIngresosResponse
    {
        public string Periodo { get; set; }
        public decimal TotalGeneral => Registros.Sum(r => r.Valor);
        public List<ReporteRegistro> Registros { get; set; } = new();
    }
}
