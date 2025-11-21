using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IQuerys
{
    public interface IAsistenciaQuery
    {
        Task<Asistencia?> GetById(int id);
        Task<List<Asistencia>> GetByMiembro(int miembroid);
        Task<List<Asistencia>> GetByClase(int claseid);
        Task<List<Asistencia>> GetByClaseYFecha(int claseid, DateTime fecha);
        Task<List<Asistencia>> GetAll();
    }
}
