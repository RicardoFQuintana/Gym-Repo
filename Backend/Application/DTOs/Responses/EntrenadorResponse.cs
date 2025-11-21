using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Responses
{
    public class EntrenadorResponse
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public int Dni { get; set; }
        public string? Direccion { get; set; }
        public int? Telefono { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? UrlFoto { get; set; }
        public string? UrlCertificado { get; set; }
        public ICollection<ClaseSummaryResponse> Clases { get; set; }
        public ICollection<MiembroSummaryResponse> Miembros { get; set; }
    }
}
