using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Exceptions;
using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;
using Application.Interfaces.IServices;
using Domain.Entities;
using Domain.Enums;
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
            var miembro = await _miembroQuery.GetByDNI(request.Dni);
            if (miembro == null)
                throw new NotFoundException("Miembro no encontrado");

            if (request.ClaseId.HasValue)
            {
                var clase = await _claseQuery.GetById(request.ClaseId.Value);
                if (clase == null)
                    throw new NotFoundException("Clase no encontrada");
            }

            if (!Enum.IsDefined(typeof(MetodoAsistencia), request.Metodo))
            {
                throw new ArgumentOutOfRangeException("Método de asistencia inválido");
            }

            var asistencia = new Asistencia
            {
                MiembroId = miembro.Id,
                ClaseId = request.ClaseId,
                Metodo = (MetodoAsistencia)request.Metodo,
                Fecha = DateTime.Now
            };

            await _command.Add(asistencia);
        }

        private static AsistenciaResponse MapToResponse(Asistencia a)
        {
            return new AsistenciaResponse
            {
                Id = a.Id,
                MiembroId = a.MiembroId,
                MiembroNombre = a.Miembro.Nombre,
                MiembroApellido = a.Miembro.Apellido,
                MiembroDni = a.Miembro.Dni,
                ClaseId = a.ClaseId,
                ClaseNombre = a.Clase?.Nombre,
                Fecha = a.Fecha,
                Metodo = a.Metodo.ToString()
            };
        }
        public async Task<AsistenciaResponse> GetById(int id)
        {
            var asistencia = await _query.GetById(id);

            if (asistencia == null)
                throw new NotFoundException("Asistencia no encontrada");

            return MapToResponse(asistencia);
        }

        public async Task<List<AsistenciaResponse>> GetAll()
        {
            var asistencias = await _query.GetAll();
            return asistencias.Select(MapToResponse).ToList();
        }

        public async Task<List<AsistenciaResponse>> GetByMiembro(int miembroId)
        {
            var asistencias = await _query.GetByMiembro(miembroId);
            return asistencias.Select(MapToResponse).ToList();
        }

        public async Task<List<AsistenciaResponse>> GetByClase(int claseId)
        {
            var asistencias = await _query.GetByClase(claseId);
            return asistencias.Select(MapToResponse).ToList();
        }
        public async Task<List<AsistenciaResponse>> GetByClaseYFecha(int claseId, DateTime fecha)
        {
            var asistencias = await _query.GetByClaseYFecha(claseId, fecha);
            return asistencias.Select(MapToResponse).ToList();
        }

        public async Task Update(int id, AsistenciaUpdateRequest request)
        {
            var asistencia = await _query.GetById(id);
            if (asistencia == null)
                throw new NotFoundException("Asistencia no encontrada");

            if (request.ClaseId.HasValue)
                asistencia.ClaseId = request.ClaseId;

            if (!Enum.IsDefined(typeof(MetodoAsistencia), request.Metodo))
                throw new ArgumentOutOfRangeException("Método de asistencia inválido");

            asistencia.Metodo = (MetodoAsistencia)request.Metodo;

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
