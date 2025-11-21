using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Entrenador : Persona
    {
        public string? UrlCertificado {  get; set; }
        public ICollection<Clase> Clases { get; set; }
        public ICollection<Miembro> Miembros { get; set; }

    }
}
