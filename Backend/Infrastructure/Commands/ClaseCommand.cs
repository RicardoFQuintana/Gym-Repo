using Application.Interfaces.ICommands;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Commands
{
    public class ClaseCommand : IClaseCommand
    {
        private readonly AppDbContext _context;

        public ClaseCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Clase> Add(Clase clase)
        {
            await _context.AddAsync(clase);
            await _context.SaveChangesAsync();

            return clase;
        }

        public async Task<Clase> Update(Clase clase)
        {
            _context.Update(clase);
            await _context.SaveChangesAsync();

            return clase;
        }

        public async Task Delete(Clase clase)
        {
            _context.Remove(clase);
            await _context.SaveChangesAsync();
        }
    }
}