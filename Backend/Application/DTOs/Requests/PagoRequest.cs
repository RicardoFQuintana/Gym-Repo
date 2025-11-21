using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Requests
{
    public class PagoRequest
    {
        public decimal Monto { get; set; }
        public int MetodoPagoId { get; set; }
        public int MembresiaId { get; set; }
    }
}
