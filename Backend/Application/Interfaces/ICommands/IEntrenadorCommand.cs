using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IEntrenadorCommand
    {
        Task<Entrenador> Add(Entrenador entrenador);
        Task<Entrenador> Update(Entrenador entrenador);
        Task Delete(Entrenador entrenador);
    }
}
