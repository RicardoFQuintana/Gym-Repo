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
        public int Dni { get; set; }
        public int? ClaseId { get; set; }
        public int Metodo { get; set; }
    }

}