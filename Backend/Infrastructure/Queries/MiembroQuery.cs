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
    public class MiembroQuery : IMiembroQuery
    {
        private readonly AppDbContext _context;

        public MiembroQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Miembro> GetById(int id)
        {
            var miembro = await _context.Miembros
                .Include(m => m.Membresia)
                    .ThenInclude(m => m.Pagos)
                    .ThenInclude(p => p.Ticket)
                .Include(m => m.Descuento)
                .Include(m => m.Inscripciones)
                .Include(m => m.Asistencias)
                .FirstOrDefaultAsync(m => m.Id == id);

            return miembro;
        }

        public async Task<Miembro> GetByDNI(int DNI)
        {
            var miembro = await _context.Miembros
                .Include(m => m.Membresia)
                    .ThenInclude(m => m.Pagos)
                    .ThenInclude(p => p.Ticket)
                .Include(m => m.Descuento)
                .Include(m => m.Inscripciones)
                .Include(m => m.Asistencias)
                .FirstOrDefaultAsync(m => m.Dni == DNI);

            return miembro;
        }

        public async Task<List<Miembro>> GetAll()
        {
            var miembro = await _context.Miembros
                .Include(m => m.Membresia)
                    .ThenInclude(m => m.Pagos)
                    .ThenInclude(p => p.Ticket)
                .Include(m => m.Descuento)
                .Include(m => m.Inscripciones)
                .Include(m => m.Asistencias)
                .ToListAsync();

            return miembro;
        }

        public async Task<bool> ExisteDni(int dni)
        {
            return await _context.Miembros.AnyAsync(m => m.Dni == dni);
        }
    }
}
