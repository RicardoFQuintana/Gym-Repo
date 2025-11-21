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
    public class ActividadService : IActividadService
    {
        private readonly IActividadQuery _query;
        private readonly IActividadCommand _command;

        public ActividadService(IActividadQuery query, IActividadCommand command)
        {
            _query = query;
            _command = command;
        }

        public async Task<ActividadResponse> Add(ActividadRequest request)
        {
            var actividad = new Actividad
            {
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
            };

            actividad = await _command.Add(actividad);

            var response = new ActividadResponse
            {
                Id = actividad.Id,
                Nombre = actividad.Nombre,
                Descripcion = actividad.Descripcion
            };

            return response;
        }

        public async Task<List<ActividadResponse>> GetAll()
        {
            var actividades = await _query.GetAll();

            var response = actividades.Select(a => new ActividadResponse
            {
                Id = a.Id,
                Nombre = a.Nombre,
                Descripcion = a.Descripcion,
            }).ToList();

            return response;
        }

        public async Task<ActividadResponse> GetById(int id)
        {
            var actividad = await _query.GetById(id);

            if (actividad == null)
                throw new NotFoundException("Actividad no encontrada");

            var response = new ActividadResponse
            {
                Id = actividad.Id,
                Nombre = actividad.Nombre,
                Descripcion = actividad.Descripcion,
            };

            return response;
        }

        public async Task<ActividadResponse> Update(int id, ActividadRequest request)
        {
            var actividad = await _query.GetById(id);

            if (actividad == null)
                throw new NotFoundException("Actividad no encontrada");

            actividad.Nombre = request.Nombre;
            actividad.Descripcion = request.Descripcion;

            actividad = await _command.Update(actividad);

            var response = new ActividadResponse
            {
                Id = actividad.Id,
                Nombre = actividad.Nombre,
                Descripcion = actividad.Descripcion
            };

            return response;
        }

        public async Task Delete(int id)
        {
            var actividad = await _query.GetById(id);

            if (actividad == null)
                throw new NotFoundException("Actividad no encontrado");

            await _command.Delete(actividad);
        }
    }
}
