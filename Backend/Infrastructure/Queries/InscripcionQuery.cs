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
    public class InscripcionQuery : IInscripcionQuery
    {
        private readonly AppDbContext _context;

        public InscripcionQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Inscripcion?> GetById(int id)
        {
            return await _context.Inscripciones
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Inscripcion>> GetByMiembro(int miembroId)
        {
            return await _context.Inscripciones
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .Where(a => a.MiembroId == miembroId)
                .OrderByDescending(a => a.FechaInscripcion)
                .ToListAsync();
        }
        public async Task<List<Inscripcion>> GetByClase(int claseId)
        {
            return await _context.Inscripciones
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .Where(a => a.ClaseId == claseId)
                .OrderByDescending(a => a.FechaInscripcion)
                .ToListAsync();
        }
        public async Task<List<Inscripcion>> GetAll()
        {
            return await _context.Inscripciones
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .ToListAsync();
        }
    }
}
