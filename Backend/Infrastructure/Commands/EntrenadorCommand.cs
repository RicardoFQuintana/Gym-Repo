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
    public class EntrenadorCommand : IEntrenadorCommand
    {
        private readonly AppDbContext _context;

        public EntrenadorCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Entrenador> Add(Entrenador entrenador)
        {
            await _context.AddAsync(entrenador);
            await _context.SaveChangesAsync();

            return entrenador;
        }

        public async Task<Entrenador> Update(Entrenador entrenador)
        {
            _context.Update(entrenador);
            await _context.SaveChangesAsync();

            return entrenador;
        }

        public async Task Delete(Entrenador entrenador)
        {
            _context.Remove(entrenador);
            await _context.SaveChangesAsync();
        }
    }
}