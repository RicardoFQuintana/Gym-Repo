using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IQuerys
{
    public interface IInscripcionQuery
    {
        Task<Inscripcion?> GetById(int id);
        Task<List<Inscripcion>> GetByMiembro(int miembroid);
        Task<List<Inscripcion>> GetByClase(int claseid);
        Task<List<Inscripcion>> GetAll();
    }
}
