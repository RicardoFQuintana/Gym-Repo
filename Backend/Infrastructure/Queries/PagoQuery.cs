using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Responses;
using Application.Interfaces.IQuerys;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Queries
{
    public class PagoQuery : IPagoQuery
    {
        private readonly AppDbContext _context;

        public PagoQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PagoResponse>> GetAllAsync()
        {
            var pagos = await _context.Pagos
                .Include(p => p.Membresia)
                .ToListAsync();

            return pagos.Select(p => new PagoResponse
            {
                Id = p.Id,
                MembresiaId = p.MembresiaId,
                Monto = p.Monto,
                Fecha = p.Fecha,
                MetodoPago = p.MetodoPago.ToString()
            }).ToList();
        }
    }
}
