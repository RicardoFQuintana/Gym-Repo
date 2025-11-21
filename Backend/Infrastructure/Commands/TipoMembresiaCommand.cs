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
    public class TipoMembresiaCommand : ITipoMembresiaCommand
    {
        private readonly AppDbContext _context;

        public TipoMembresiaCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<TipoMembresia> Add(TipoMembresia tipomembresia)
        {
            await _context.AddAsync(tipomembresia);
            await _context.SaveChangesAsync();

            return tipomembresia;
        }

        public async Task<TipoMembresia> Update(TipoMembresia tipomembresia)
        {
            _context.Update(tipomembresia);
            await _context.SaveChangesAsync();

            return tipomembresia;
        }

        public async Task Delete(TipoMembresia tipomembresia)
        {
            _context.Remove(tipomembresia);
            await _context.SaveChangesAsync();
        }
    }
}