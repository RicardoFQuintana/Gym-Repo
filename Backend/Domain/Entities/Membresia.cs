using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Membresia
    {
        public int Id { get; set; }
        public int MiembroId { get; set; }
        public int TipoMembresiaId { get; set; }
        public decimal CostoFinal { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaVencimiento { get; set; }

        public Miembro Miembro { get; set; }
        public TipoMembresia TipoMembresia { get; set; }
        public ICollection<Pago> Pagos { get; set; }
    }
}
