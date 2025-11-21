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
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace Application.UseCases
{
    public class AsistenciaService : IAsistenciaService
    {
        private readonly IAsistenciaQuery _query;
        private readonly IAsistenciaCommand _command;
        private readonly IMiembroQuery _miembroQuery;
        private readonly IClaseQuery _claseQuery;

        public AsistenciaService(IAsistenciaQuery query, IAsistenciaCommand command, IMiembroQuery miembroQuery, IClaseQuery claseQuery)
        {
            _query = query;
            _command = command;
            _miembroQuery = miembroQuery;
            _claseQuery = claseQuery;
        }

        public async Task Add(AsistenciaAddRequest request)
        {
            if (await _miembroQuery.GetById(request.MiembroId) == null)
                throw new NotFoundException("Miembro no encontrado");
            if (await _claseQuery.GetById(request.ClaseId) == null)
                throw new NotFoundException("Clase no encontrada");
            var asistencia = new Asistencia
            {
                MiembroId = request.MiembroId,
                ClaseId = request.ClaseId,
                Fecha = request.Fecha
            };

           await _command.Add(asistencia);
        }
        public async Task<AsistenciaResponse> GetById(int id)
        {
            var asistencia = await _query.GetById(id);

            if (asistencia == null)
                throw new NotFoundException("Asistencia no encontrada");

            var response = new AsistenciaResponse
            {
                Id = asistencia.Id,
                MiembroId = asistencia.MiembroId,
                MiembroNombre = asistencia.Miembro.Nombre,
                MiembroApellido = asistencia.Miembro.Apellido,
                ClaseId = asistencia.ClaseId,
                ClaseNombre = asistencia.Clase.Nombre,
                Fecha = asistencia.Fecha
            };

            return response;
        }
        public async Task<List<AsistenciaResponse>> GetByMiembro(int miembroId)
        {
            var asistencia = await _query.GetByMiembro(miembroId);

            var response = asistencia.Select(a => new AsistenciaResponse
            {
                Id = a.Id,
                MiembroId = a.MiembroId,
                MiembroNombre = a.Miembro.Nombre,
                MiembroApellido = a.Miembro.Apellido,
                ClaseId = a.ClaseId,
                ClaseNombre = a.Clase.Nombre,
                Fecha = a.Fecha
            }).ToList();

            return response;
        }

        public async Task<List<AsistenciaResponse>> GetByClase(int claseId)
        {
            var asistencia = await _query.GetByClase(claseId);

            var response = asistencia.Select(a => new AsistenciaResponse
            {
                Id = a.Id,
                MiembroId = a.MiembroId,
                MiembroNombre = a.Miembro.Nombre,
                MiembroApellido = a.Miembro.Apellido,
                ClaseId = a.ClaseId,
                ClaseNombre = a.Clase.Nombre,
                Fecha = a.Fecha
            }).ToList();

            return response;
        }
        public async Task<List<AsistenciaResponse>> GetByClaseYFecha(int claseId, DateTime fecha)
        {
            var asistencia = await _query.GetByClaseYFecha(claseId, fecha);

            var response = asistencia.Select(a => new AsistenciaResponse
            {
                Id = a.Id,
                MiembroId = a.MiembroId,
                MiembroNombre = a.Miembro.Nombre,
                MiembroApellido = a.Miembro.Apellido,
                ClaseId = a.ClaseId,
                ClaseNombre = a.Clase.Nombre,
                Fecha = a.Fecha
            }).ToList();

            return response;
        }

        public async Task Update(int id, AsistenciaUpdateRequest request)
        {
            var asistencia = await _query.GetById(id);

            if (asistencia == null)
                throw new NotFoundException("Asistencia no encontrada");

            asistencia.Id = request.Id;
            asistencia.MiembroId = request.MiembroId;
            asistencia.ClaseId = request.ClaseId;
            asistencia.Fecha = request.Fecha;

            await _command.Update(asistencia);
        }

        public async Task Delete(int id)
        {
            var asistencia = await _query.GetById(id);

            if (asistencia == null)
                throw new NotFoundException("Asistencia no encontrada");

            await _command.Delete(asistencia);
        }
    }
}
