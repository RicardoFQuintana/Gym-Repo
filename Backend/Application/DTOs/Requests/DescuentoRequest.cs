using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Requests
{
    public class DescuentoRequest
    {
        public string Nombre { get; set; }
        public decimal Porcentaje { get; set; }
    }
}
