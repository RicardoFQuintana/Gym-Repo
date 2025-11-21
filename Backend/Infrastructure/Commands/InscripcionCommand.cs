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
    public class InscripcionCommand : IInscripcionCommand
    {
        private readonly AppDbContext _context;
        public InscripcionCommand(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Inscripcion> Add(Inscripcion Inscripcion)
        {
            await _context.AddAsync(Inscripcion);
            await _context.SaveChangesAsync();
            return Inscripcion;
        }
        public async Task Delete(Inscripcion Inscripcion)
        {
            _context.Remove(Inscripcion);
            await _context.SaveChangesAsync();
        }
    }
}