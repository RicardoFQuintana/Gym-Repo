using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IMiembroCommand
    {
        Task<Miembro> Add(Miembro miembro);
        Task<Miembro> Update(Miembro miembro);
        Task Delete(Miembro miembro);
    }
}
