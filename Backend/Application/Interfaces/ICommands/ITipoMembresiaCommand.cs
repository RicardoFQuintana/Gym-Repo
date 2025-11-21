using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface ITipoMembresiaCommand
    {
        Task<TipoMembresia> Add(TipoMembresia tipoMembresia);
        Task<TipoMembresia> Update(TipoMembresia tipoMembresia);
        Task Delete(TipoMembresia tipoMembresia);
    }
}
