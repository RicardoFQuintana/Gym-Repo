using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class DescuentoResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal Porcentaje { get; set; }
    }
}
