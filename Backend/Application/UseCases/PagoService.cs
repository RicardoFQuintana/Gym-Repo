using Application.Interfaces.IServices;
using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Exceptions;
using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;
using Domain.Entities;
using Domain.Enums;

namespace Application.UseCases
{
    public class PagoService : IPagoService
    {
        private readonly IPagoQuery _query;
        private readonly IMembresiaQuery _queryMembresia;
        private readonly IPagoCommand _command;

        public PagoService(IPagoQuery query, IPagoCommand command, IMembresiaQuery queryMembresia)
        {
            _query = query;
            _command = command;
            _queryMembresia = queryMembresia;
        }

        public async Task<PagoResponse> Add(PagoRequest request)
        {

            var membresia = await _queryMembresia.GetById(request.MembresiaId);

            if (membresia == null)
                throw new NotFoundException($"No existe membresía con ID {request.MembresiaId}");

            if (!Enum.IsDefined(typeof(MetodoPago), request.MetodoPagoId))
                throw new BadRequestException("Método de pago inválido");

            var pago = new Pago
            {
                MembresiaId = membresia.Id,
                Monto = request.Monto,
                Fecha = DateTime.Now,
                MetodoPago = (MetodoPago)request.MetodoPagoId,
                Ticket = new Ticket
                {
                    FechaEmision = DateTime.Now,
                    Detalle = $"Pago de membresía de {membresia.Miembro.Nombre} {membresia.Miembro.Apellido}"
                }
            };


            pago = await _command.AddAsync(pago);


            return new PagoResponse
            {
                Id = pago.Id,
                MembresiaId = pago.MembresiaId,
                Monto = pago.Monto,
                Fecha = pago.Fecha,
                MetodoPago = pago.MetodoPago.ToString(),
                Ticket = pago.Ticket == null ? null : new TicketResponse
                {
                    Id = pago.Ticket.Id,
                    FechaEmision = pago.Ticket.FechaEmision,
                    Detalle = pago.Ticket.Detalle
                }
            };
        }

        public async Task<IEnumerable<PagoResponse>> GetAll()
        {
            return await _query.GetAllAsync();
        }
    }
}