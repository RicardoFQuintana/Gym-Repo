using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Miembro : Persona
    {
        public int DescuentoId { get; set; }
        public int? EntrenadorId { get; set; }
        public Entrenador Entrenador { get; set; }
        public Membresia Membresia { get; set; }
        public Descuento Descuento { get; set; }
        public ICollection<Inscripcion> Inscripciones { get; set; }
        public ICollection<Asistencia> Asistencias { get; set; }
    }
}
