using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IClaseCommand
    {
        Task<Clase> Add(Clase clase);
        Task<Clase> Update(Clase clase);
        Task Delete(Clase clase);
    }
}
