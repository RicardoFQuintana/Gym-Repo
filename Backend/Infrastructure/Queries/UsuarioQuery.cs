using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.IQuerys;
using Domain.Entities;
using Infrastructure.Persistence;

namespace Infrastructure.Queries
{
    public class UsuarioQuery : IUsuarioQuery
    {
        private readonly AppDbContext _context;

        public UsuarioQuery(AppDbContext context)
        {
            _context = context;
        }

        public Empleado? Execute(string usuario)
        {
            return _context.Empleados
                .FirstOrDefault(e => e.Usuario == usuario && e.Activo);
        }
    }
}
