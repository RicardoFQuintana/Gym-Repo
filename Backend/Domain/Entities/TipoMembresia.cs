using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class TipoMembresia
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public int DuracionDias { get; set; }
        public decimal Costo { get; set; }

        public ICollection<Membresia> Membresias { get; set; }
    }
}