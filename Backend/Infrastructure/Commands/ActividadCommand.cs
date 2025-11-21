using Application.Interfaces.ICommands;
using Domain.Entities;
using Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Commands
{
    public class ActividadCommand : IActividadCommand
    {
        private readonly AppDbContext _context;

        public ActividadCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Actividad> Add(Actividad actividad)
        {
            await _context.AddAsync(actividad);
            await _context.SaveChangesAsync();

            return actividad;
        }

        public async Task<Actividad> Update(Actividad actividad)
        {
            _context.Update(actividad);
            await _context.SaveChangesAsync();

            return actividad;
        }

        public async Task Delete(Actividad actividad)
        {
            _context.Remove(actividad);
            await _context.SaveChangesAsync();
        }
    }
}
