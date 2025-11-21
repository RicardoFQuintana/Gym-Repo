using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class TicketResponse
    {
        public int Id { get; set; }
        public DateTime FechaEmision { get; set; }
        public string Detalle { get; set; }
    }
}
