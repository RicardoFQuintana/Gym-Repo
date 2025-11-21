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
    public class ActividadQuery : IActividadQuery
    {
        private readonly AppDbContext _context;

        public ActividadQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Actividad> GetById(int id)
        {
            var actividad = await _context.Actividades.FirstOrDefaultAsync(m => m.Id == id);

            return actividad;
        }

        public async Task<List<Actividad>> GetAll()
        {
            var miembro = await _context.Actividades.ToListAsync();

            return miembro;
        }
    }
}
