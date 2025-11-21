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
    public class MembresiaCommand : IMembresiaCommand
    {
        private readonly AppDbContext _context;

        public MembresiaCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Membresia> Update(Membresia membresia)
        {
            _context.Update(membresia);
            await _context.SaveChangesAsync();

            return membresia;
        }

        public async Task Delete(Membresia membresia)
        {
            _context.Remove(membresia);
            await _context.SaveChangesAsync();
        }
    }
}
