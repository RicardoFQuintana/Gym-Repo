using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Asistencia
    {
        public int Id { get; set; }
        public int MiembroId { get; set; }
        public int? ClaseId { get; set; }
        public DateTime Fecha { get; set; }

        public Miembro Miembro { get; set; }
        public Clase Clase { get; set; }
    }
}
