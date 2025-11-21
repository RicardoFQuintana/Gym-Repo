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
    public class ClaseService : IClaseService
    {
        private readonly IClaseQuery _query;
        private readonly IClaseCommand _command;
        private readonly IEntrenadorQuery _entrenadorQuery;
        private readonly IEntrenadorCommand _entrenadorCommand;
        private readonly IActividadQuery _actividadQuery;

        public ClaseService(IClaseQuery query, IClaseCommand command, IEntrenadorQuery entrenadorQuery, IActividadQuery actividadQuery, IEntrenadorCommand entrenadorCommand)
        {
            _query = query;
            _command = command;
            _entrenadorQuery = entrenadorQuery;
            _actividadQuery = actividadQuery;
            _entrenadorCommand = entrenadorCommand;
        }

        public async Task Add(ClaseAddRequest request)
        {
            var entrenador = await _entrenadorQuery.GetById(request.EntrenadorId);
            if (entrenador == null)
            {
                throw new ConflictException($"No existe un entrenador con el ID {request.EntrenadorId}");
            }
            var actividad = await _actividadQuery.GetById(request.ActividadId);
            if (actividad == null)
            {
                throw new ConflictException($"No existe una actividad con el ID {request.ActividadId}");
            }
            if (request.HoraFin <= request.HoraInicio)
            {
                throw new ConflictException("La hora de fin debe ser posterior a la hora de inicio");
            }
            if (request.Cupo <= 0)
            {
                throw new ConflictException("El cupo debe ser mayor a cero");
            }
            var clase = new Clase
            {
                Nombre = request.Nombre,
                Cupo = request.Cupo,
                Dia = request.Dia,
                HoraInicio = request.HoraInicio,
                HoraFin = request.HoraFin,
                EntrenadorId = request.EntrenadorId,
                ActividadId = request.ActividadId,
                Entrenador = entrenador,
                Actividad = actividad
            };
            
            await _command.Add(clase);
            
        }

        public async Task<List<ClaseResponse>> GetAll()
        {
            var clase = await _query.GetAll();

            var response = clase.Select(c => new ClaseResponse
            {
                Id = c.Id,
                Nombre = c.Nombre,
                InscriptosCount = c.Inscripciones.Count,
                Cupo = c.Cupo,
                Dia = c.Dia,
                HoraInicio = c.HoraInicio,
                HoraFin = c.HoraFin,
                EntrenadorId = c.EntrenadorId,
                EntrenadorNombre = c.Entrenador.Nombre,
                EntrenadorApellido = c.Entrenador.Apellido,
                ActividadNombre = c.Actividad.Nombre,
                Inscripciones = c.Inscripciones.Select(i => new InscripcionSummaryResponse
                {
                    Id = i.Id,
                    MiembroId = i.MiembroId,
                    MiembroNombre = i.Miembro.Nombre,
                    MiembroApellido = i.Miembro.Apellido,
                }).ToList()
            }).ToList();

            return response;
        }

        public async Task<ClaseResponse> GetById(int id)
        {
            var clase = await _query.GetById(id);

            if (clase == null)
                throw new NotFoundException("Clase no encontrada");

            var response = new ClaseResponse
            {
                Id = clase.Id,
                Nombre = clase.Nombre,
                Cupo = clase.Cupo,
                Dia = clase.Dia,
                HoraInicio = clase.HoraInicio,
                HoraFin = clase.HoraFin,
                EntrenadorId = clase.EntrenadorId,
                EntrenadorNombre = clase.Entrenador.Nombre,
                EntrenadorApellido = clase.Entrenador.Apellido,
                ActividadNombre = clase.Actividad.Nombre,
                Inscripciones = clase.Inscripciones.Select(i => new InscripcionSummaryResponse
                {
                    Id = i.Id,
                    MiembroId = i.MiembroId,
                    MiembroNombre = i.Miembro.Nombre,
                    MiembroApellido = i.Miembro.Apellido,
                }).ToList()
            };

            return response;
        }

        public async Task Update(int id, ClaseUpdateRequest request)
        {
            var clase = await _query.GetById(id);
            var entrenador = await _entrenadorQuery.GetById(request.EntrenadorId);
            var actividad = await _actividadQuery.GetById(request.ActividadId);

            if (clase == null)
                throw new NotFoundException("Clase no encontrada");
            if(entrenador == null)
                throw new ConflictException($"No existe un entrenador con el ID {request.EntrenadorId}");
            if (actividad == null)
                throw new ConflictException($"No existe una actividad con el ID {request.ActividadId}");

            clase.Nombre = request.Nombre;
            clase.Cupo = request.Cupo;
            clase.Dia = request.Dia;
            clase.HoraInicio = request.HoraInicio;
            clase.HoraFin = request.HoraFin;
            clase.EntrenadorId = request.EntrenadorId;
            clase.Actividad = actividad;
            
            await _command.Update(clase);
            
        }

        public async Task Delete(int id)
        {
            var clase = await _query.GetById(id);

            if (clase == null)
                throw new NotFoundException("Clase no encontrada");

            await _command.Delete(clase);
        }
    }
}
