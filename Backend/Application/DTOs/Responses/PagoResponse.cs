using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class PagoResponse
    {
        public int Id { get; set; }
        public int MembresiaId { get; set; }
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }
        public string MetodoPago { get; set; }
        public TicketResponse Ticket { get; set; }
    }
}
