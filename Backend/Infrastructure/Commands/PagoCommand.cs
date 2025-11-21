using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Exceptions;
using Application.Interfaces.ICommands;
using Azure.Core;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Commands
{
    public class PagoCommand : IPagoCommand
    {
        private readonly AppDbContext _context;

        public PagoCommand(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagoResponse> AddAsync(PagoRequest request)
        {
            var membresia = await _context.Membresias
                .FirstOrDefaultAsync(m => m.Id == request.MembresiaId);

            if (membresia == null)
                throw new NotFoundException($"No existe una membresía con ID {request.MembresiaId}");

            var pago = new Pago
            {
                MembresiaId = request.MembresiaId,
                Monto = request.Monto,
                Fecha = DateTime.Now,
                MetodoPago = (MetodoPago)request.MetodoPagoId
            };

            _context.Pagos.Add(pago);
            await _context.SaveChangesAsync();

            return new PagoResponse
            {
                Id = pago.Id,
                MembresiaId = pago.MembresiaId,
                Monto = pago.Monto,
                Fecha = pago.Fecha,
                MetodoPago = pago.MetodoPago.ToString()
            };
        }
    }
}
