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
    public class MembresiaQuery : IMembresiaQuery
    {
        private readonly AppDbContext _context;

        public MembresiaQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Membresia> GetById(int id)
        {
            var membresia = await _context.Membresias.Include(m => m.Miembro).FirstOrDefaultAsync(m => m.Id == id);

            return membresia;
        }

        public async Task<List<Membresia>> GetAll()
        {
            var membresia = await _context.Membresias.ToListAsync();

            return membresia;
        }
    }
}
