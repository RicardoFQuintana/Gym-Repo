using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IQuerys
{
    public interface IEntrenadorQuery
    {
        Task<Entrenador> GetById(int id);
        Task<List<Entrenador>> GetAll();
        Task<bool> ExisteDni(int dni);
    }
}
