using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.Interfaces.IQuerys
{
    public interface IUsuarioQuery
    {
        Empleado? Execute(string usuario);
    }
}
