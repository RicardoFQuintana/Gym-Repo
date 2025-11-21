using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IDescuentoCommand
    {
        Task<Descuento> Add(Descuento descuento);
        Task<Descuento> Update(Descuento descuento);
        Task Delete(Descuento descuento);
    }
}
