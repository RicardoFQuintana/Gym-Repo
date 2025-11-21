using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IMembresiaCommand
    {
        Task<Membresia> Update(Membresia membresia);
        Task Delete(Membresia membresia);
    }
}
