using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class TipoMembresiaResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public int DuracionDias { get; set; }
        public decimal Costo { get; set; }
    }
}
