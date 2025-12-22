using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Empleado
    {
        public int Id { get; set; }
        public string Usuario { get; set; }
        public string PasswordHash { get; set; }
        public string Rol { get; set; }
        public bool Activo { get; set; }
    }
}
