using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Descuento
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal Porcentaje { get; set; }

        public ICollection<Miembro> Miembros { get; set;}
    }
}
