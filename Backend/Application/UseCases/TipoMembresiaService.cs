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
    public class TipoMembresiaService : ITipoMembresiaService
    {
        private readonly ITipoMembresiaQuery _query;
        private readonly ITipoMembresiaCommand _command;

        public TipoMembresiaService(ITipoMembresiaQuery query, ITipoMembresiaCommand command)
        {
            _query = query;
            _command = command;
        }

        public async Task<TipoMembresiaResponse> Add(TipoMembresiaRequest request)
        {
            var tipoMembresia = new TipoMembresia
            {
                Nombre = request.Nombre,
                DuracionDias = request.DuracionDias,
                Costo = request.Costo,
            };

            tipoMembresia = await _command.Add(tipoMembresia);

            var response = new TipoMembresiaResponse
            {
                Id = tipoMembresia.Id,
                Nombre = tipoMembresia.Nombre,
                DuracionDias = tipoMembresia.DuracionDias,
                Costo = tipoMembresia.Costo
            };

            return response;
        }

        public async Task<List<TipoMembresiaResponse>> GetAll()
        {
            var tiposMembresia = await _query.GetAll();

            var response = tiposMembresia.Select(m => new TipoMembresiaResponse
            {
                Id = m.Id,
                Nombre = m.Nombre,
                DuracionDias = m.DuracionDias,
                Costo = m.Costo,
            }).ToList();

            return response;
        }

        public async Task<TipoMembresiaResponse> GetById(int id)
        {
            var tipoMembresia =  await _query.GetById(id);

            if (tipoMembresia == null)
                throw new NotFoundException("Tipo de membresía no encontrado");

            var response = new TipoMembresiaResponse
            {
                Id = tipoMembresia.Id,
                Nombre = tipoMembresia.Nombre,
                DuracionDias = tipoMembresia.DuracionDias,
                Costo = tipoMembresia.Costo,
            };
            
            return response;
        }

        public async Task<TipoMembresiaResponse> Update(int id, TipoMembresiaRequest request)
        {
            var tipoMembresia = await _query.GetById(id);

            if (tipoMembresia == null)
                throw new NotFoundException("Tipo de Membresía no encontrado");

            tipoMembresia.Nombre = request.Nombre;
            tipoMembresia.DuracionDias = request.DuracionDias;
            tipoMembresia.Costo = request.Costo;

            tipoMembresia = await _command.Update(tipoMembresia);

            var response = new TipoMembresiaResponse
            {
                Id = tipoMembresia.Id,
                Nombre = tipoMembresia.Nombre,
                DuracionDias = tipoMembresia.DuracionDias,
                Costo = tipoMembresia.Costo
            };

            return response;
        }

        public async Task Delete(int id)
        {
            var tipomembresia = await _query.GetById(id);

            if (tipomembresia == null)
                throw new NotFoundException("Tipo de membresía no encontrado");

            await _command.Delete(tipomembresia);
        }
    }
}
