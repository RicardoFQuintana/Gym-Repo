using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Ticket
    {
        public int Id { get; set; }
        public int PagoId { get; set; }
        public DateTime FechaEmision { get; set; }
        public string Detalle { get; set; }

        public Pago Pago { get; set; }
    }
}
