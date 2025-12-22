using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Exceptions;
using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;
using Application.Interfaces.IServices;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.UseCases
{
    public class MembresiaService : IMembresiaService
    {
        private readonly IMembresiaQuery _query;
        private readonly IMembresiaCommand _command;

        public MembresiaService(IMembresiaQuery query, IMembresiaCommand command)
        {
            _query = query;
            _command = command;
        }

        public async Task<List<MembresiaResponse>> GetAll()
        {
            var membresias = await _query.GetAll();

            var response = membresias.Select(m => new MembresiaResponse
            {
                Id = m.Id,
                MiembroId = m.MiembroId,
                FechaInicio = m.FechaInicio,
                FechaVencimiento = m.FechaVencimiento,
                Pagos = m.Pagos.Select(p => new PagoResponse
                {
                    Id = p.Id,
                    Monto = p.Monto,
                    Fecha = p.Fecha,
                    MetodoPago = p.MetodoPago.ToString()

                }).ToList()

            }).ToList();

            return response;
        }

        public async Task<MembresiaResponse> GetById(int id)
        {
            var membresia = await _query.GetById(id);

            if (membresia == null)
                throw new NotFoundException("Membresia no encontrada");

            var response = new MembresiaResponse
            {
                Id = membresia.Id,
                MiembroId = membresia.MiembroId,
                TipoMembresiaId = membresia.TipoMembresiaId,
                FechaInicio = membresia.FechaInicio,
                FechaVencimiento = membresia.FechaVencimiento,
                Pagos = membresia.Pagos.Select(p => new PagoResponse
                {
                    Id = p.Id,
                    Monto = p.Monto,
                    Fecha = p.Fecha,
                    MetodoPago = p.MetodoPago.ToString()

                }).ToList()
            };

            return response;
        }

        public async Task Delete(int id)
        {
            var membresia = await _query.GetById(id);

            if (membresia == null)
                throw new NotFoundException("Membresia no encontrada");

            await _command.Delete(membresia);
        }
    }
}
