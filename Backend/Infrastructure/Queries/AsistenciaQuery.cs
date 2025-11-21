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
    public class AsistenciaQuery : IAsistenciaQuery
    {
        private readonly AppDbContext _context;

        public AsistenciaQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Asistencia?> GetById(int id)
        {
            return await _context.Asistencias
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Asistencia>> GetByMiembro(int miembroId)
        {
            return await _context.Asistencias
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .Where(a => a.MiembroId == miembroId)
                .OrderByDescending(a => a.Fecha)
                .ToListAsync();
        }
        public async Task<List<Asistencia>> GetByClase(int claseId)
        {
            return await _context.Asistencias
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .Where(a => a.ClaseId == claseId)
                .OrderByDescending(a => a.Fecha)
                .ToListAsync();
        }

        public async Task<List<Asistencia>> GetByClaseYFecha(int claseId, DateTime fecha)
        {
            return await _context.Asistencias
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .Where(a => a.ClaseId == claseId &&
                           a.Fecha.Date == fecha.Date)
                .OrderByDescending(a => a.Fecha)
                .ToListAsync();
        }
        public async Task<List<Asistencia>> GetAll()
        {
            return await _context.Asistencias
                .Include(a => a.Miembro)
                .Include(a => a.Clase)
                .ToListAsync();
        }
    }
}
