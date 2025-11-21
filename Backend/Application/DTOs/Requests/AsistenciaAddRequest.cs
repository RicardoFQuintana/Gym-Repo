using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Requests
{
    public class AsistenciaAddRequest
    {
        public int MiembroId { get; set; }
        public int ClaseId { get; set; }
        public DateTime Fecha { get; set; }
    }
}
