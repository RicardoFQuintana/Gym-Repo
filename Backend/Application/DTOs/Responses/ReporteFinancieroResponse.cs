using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class ReporteFinancieroResponse
    {
        public string Periodo { get; set; }
        public decimal Total { get; set; }
        public List<ReporteRegistro> Detalle { get; set; } = new();
    }
}
