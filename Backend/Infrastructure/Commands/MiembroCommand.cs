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
    public class MiembroCommand : IMiembroCommand
    {
        private readonly AppDbContext _context;

        public MiembroCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Miembro> Add(Miembro miembro)
        {
            await _context.AddAsync(miembro);
            await _context.SaveChangesAsync();

            return miembro;
        }

        public async Task<Miembro> Update(Miembro miembro)
        {
            _context.Update(miembro);
            await _context.SaveChangesAsync();

            return miembro;
        }

        public async Task Delete(Miembro miembro)
        {
            _context.Remove(miembro);
            await _context.SaveChangesAsync();
        }
    }
}