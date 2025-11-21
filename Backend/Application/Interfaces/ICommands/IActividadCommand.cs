using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IActividadCommand
    {
        Task<Actividad> Add(Actividad actividad);
        Task<Actividad> Update(Actividad actividad);
        Task Delete(Actividad actividad);
    }
}
