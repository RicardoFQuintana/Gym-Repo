using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Pago
    {
        public int Id { get; set; }
        public int MembresiaId { get; set; }
        public decimal Monto { get; set; }
        public DateTime Fecha { get; set; }
        public MetodoPago MetodoPago { get; set; }

        public Membresia Membresia { get; set; }
        public Ticket Ticket { get; set; }
    }
}