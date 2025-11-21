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
    public class AsistenciaCommand : IAsistenciaCommand
    {
        private readonly AppDbContext _context;
        public AsistenciaCommand(AppDbContext context)
        {
            _context = context;
        }
        public async Task<Asistencia> Add(Asistencia asistencia)
        {
            await _context.AddAsync(asistencia);
            await _context.SaveChangesAsync();
            return asistencia;
        }
        public async Task<Asistencia> Update(Asistencia asistencia)
        {
            _context.Update(asistencia);
            await _context.SaveChangesAsync();
            return asistencia;
        }
        public async Task Delete(Asistencia asistencia)
        {
            _context.Remove(asistencia);
            await _context.SaveChangesAsync();
        }
    }
}