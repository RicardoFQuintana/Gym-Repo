using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.ICommands
{
    public interface ILoginCommand
    {
        Empleado Execute(string passwordIngresada, Empleado empleado);
    }
}
