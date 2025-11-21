using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IAsistenciaCommand
    {
        Task<Asistencia> Add(Asistencia asistencia);
        Task<Asistencia> Update(Asistencia asistencia);
        Task Delete(Asistencia asistencia);
    }
}
