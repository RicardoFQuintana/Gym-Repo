using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class MembresiaResponse
    {
        public int Id { get; set; }
        public int MiembroId { get; set; }
        public int TipoMembresiaId { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaVencimiento { get; set; }
        public ICollection<PagoResponse>? Pagos { get; set; }

    }
}
