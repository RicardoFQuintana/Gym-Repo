using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public abstract class Persona
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public int Dni { get; set; }
        public string? Direccion { get; set; }
        public int? Telefono { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? UrlFoto { get; set; }
    }
}
