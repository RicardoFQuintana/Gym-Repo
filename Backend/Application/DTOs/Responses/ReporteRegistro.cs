using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class ReporteRegistro
    {
        public string Clave { get; set; }   // Ej: "Efectivo", "Anual", "Spinning"
        public decimal Valor { get; set; }  // Ej: monto total o cantidad
    }
}
