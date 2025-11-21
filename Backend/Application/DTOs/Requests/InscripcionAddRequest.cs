using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.Requests
{
    public class InscripcionAddRequest
    {
        public int MiembroId { get; set; }
        public int ClaseId { get; set; }
    }
}
