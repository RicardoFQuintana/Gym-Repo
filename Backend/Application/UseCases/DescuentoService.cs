//<<<<<<< HEAD
﻿using Application.Exceptions;
using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;
using Application.Interfaces.IServices;
//=======
﻿using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.UseCases
{
    public class DescuentoService : IDescuentoService
    {
        private readonly IDescuentoQuery _query;
        private readonly IDescuentoCommand _command;

        public DescuentoService(IDescuentoQuery query, IDescuentoCommand command)
        {
            _query = query;
            _command = command;
        }

        public async Task<DescuentoResponse> Add(DescuentoRequest request)
        {
            if (request.Porcentaje <0 || request.Porcentaje > 1)
                throw new ConflictException("El porcentaje debe estar entre 0 y 1");
            var descuento = new Descuento
            {
                Nombre = request.Nombre,
                Porcentaje = request.Porcentaje
            };

            descuento = await _command.Add(descuento);

            var response = new DescuentoResponse
            {
                Id = descuento.Id,
                Nombre = descuento.Nombre,
                Porcentaje = descuento.Porcentaje
            };

            return response;
        }

        public async Task<List<DescuentoResponse>> GetAll()
        {
            var descuentos = await _query.GetAll();

            var response = descuentos.Select(a => new DescuentoResponse
            {
                Id = a.Id,
                Nombre = a.Nombre,
                Porcentaje = a.Porcentaje,
            }).ToList();

            return response;
        }

        public async Task<DescuentoResponse> GetById(int id)
        {
            var descuento = await _query.GetById(id);

            if (descuento == null)
                throw new NotFoundException("Descuento no encontrado");

            var response = new DescuentoResponse
            {
                Id = descuento.Id,
                Nombre = descuento.Nombre,
                Porcentaje = descuento.Porcentaje,
            };

            return response;
        }

        public async Task<DescuentoResponse> Update(int id, DescuentoRequest request)
        {
            var descuento = await _query.GetById(id);

            if (descuento == null)
                throw new NotFoundException("Descuento no encontrado");
            if (request.Porcentaje < 0 || request.Porcentaje > 1)
                throw new ConflictException("El porcentaje debe estar entre 0 y 1");

            descuento.Nombre = request.Nombre;
            descuento.Porcentaje = request.Porcentaje;

            descuento = await _command.Update(descuento);

            var response = new DescuentoResponse
            {
                Id = descuento.Id,
                Nombre = descuento.Nombre,
                Porcentaje = descuento.Porcentaje
            };

            return response;
        }

        public async Task Delete(int id)
        {
            var descuento = await _query.GetById(id);

            if (descuento == null)
                throw new NotFoundException("Descuento no encontrado");

            await _command.Delete(descuento);
        }
    }
}
