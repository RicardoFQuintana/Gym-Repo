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
    public class DescuentoCommand : IDescuentoCommand
    {
        private readonly AppDbContext _context;

        public DescuentoCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Descuento> Add(Descuento descuento)
        {
            await _context.AddAsync(descuento);
            await _context.SaveChangesAsync();

            return descuento;
        }

        public async Task<Descuento> Update(Descuento descuento)
        {
            _context.Update(descuento);
            await _context.SaveChangesAsync();

            return descuento;
        }

        public async Task Delete(Descuento descuento)
        {
            _context.Remove(descuento);
            await _context.SaveChangesAsync();
        }
    }
}
