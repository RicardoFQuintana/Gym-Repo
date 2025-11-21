using Application.Interfaces.IQuerys;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Queries
{
    public class ClaseQuery : IClaseQuery
    {
        private readonly AppDbContext _context;

        public ClaseQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Clase> GetById(int id)
        {
            var clase = await _context.Clases
                .Include(c => c.Entrenador)
                .Include(c => c.Actividad)
                .Include(c => c.Inscripciones)
                    .ThenInclude(i => i.Miembro)
                .FirstOrDefaultAsync(m => m.Id == id);

            return clase;
        }

        public async Task<List<Clase>> GetAll()
        {
            var clase = await _context.Clases
                .Include(c => c.Entrenador)
                .Include(c => c.Actividad)
                .Include(c => c.Inscripciones)
                    .ThenInclude(i => i.Miembro)
                .ToListAsync();

            return clase;
        }
    }
}
