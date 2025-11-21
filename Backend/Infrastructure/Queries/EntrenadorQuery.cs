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
    public class EntrenadorQuery : IEntrenadorQuery
    {
        private readonly AppDbContext _context;

        public EntrenadorQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Entrenador> GetById(int id)
        {
            var entrenador = await _context.Entrenadores
                .Include(e => e.Clases)
                .Include(e => e.Miembros)
                .FirstOrDefaultAsync(m => m.Id == id);

            return entrenador;
        }

        public async Task<List<Entrenador>> GetAll()
        {
            var entrenador = await _context.Entrenadores
                .Include(e => e.Clases)
                .Include(e => e.Miembros)
                .ToListAsync();

            return entrenador;
        }
        public async Task<bool> ExisteDni(int dni)
        {
            return await _context.Entrenadores.AnyAsync(m => m.Dni == dni);
        }
    }
}
