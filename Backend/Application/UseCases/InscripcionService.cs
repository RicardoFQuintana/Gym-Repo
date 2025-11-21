using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Exceptions;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.IQuerys;
using Application.Interfaces.IServices;
using Application.Interfaces.ICommands;

namespace Application.UseCases
{
    public class InscripcionService : IInscripcionService
    {
        private readonly IInscripcionQuery _query;
        private readonly IInscripcionCommand _command;
        private readonly IMiembroQuery _miembroQuery;
        private readonly IClaseQuery _claseQuery;

        public InscripcionService(IInscripcionQuery query, IInscripcionCommand command, IMiembroQuery miembroQuery, IClaseQuery claseQuery)
        {
            _query = query;
            _command = command;
            _miembroQuery = miembroQuery;
            _claseQuery = claseQuery;
        }

        public async Task Add(InscripcionAddRequest request)
        {
            if (await _miembroQuery.GetById(request.MiembroId) == null)
                throw new NotFoundException("Miembro no encontrado");
            if (await _claseQuery.GetById(request.ClaseId) == null)
                throw new NotFoundException("Clase no encontrada");
            var inscripcion = new Inscripcion
            {
                MiembroId = request.MiembroId,
                ClaseId = request.ClaseId,
            };

           await _command.Add(inscripcion);
        }
        public async Task<InscripcionResponse> GetById(int id)
        {
            var inscripcion = await _query.GetById(id);

            if (inscripcion == null)
                throw new NotFoundException("Asistencia no encontrada");

            var response = new InscripcionResponse
            {
                Id = inscripcion.Id,
                MiembroId = inscripcion.MiembroId,
                MiembroNombre = inscripcion.Miembro.Nombre,
                MiembroApellido = inscripcion.Miembro.Apellido,
                ClaseId = inscripcion.ClaseId,
                ClaseNombre = inscripcion.Clase.Nombre,
                ClaseDia = inscripcion.Clase.Dia,
                ClaseHoraInicio = inscripcion.Clase.HoraInicio,
                ClaseHoraFin = inscripcion.Clase.HoraFin,
                FechaInscripcion = inscripcion.FechaInscripcion
            };

            return response;
        }
        public async Task<List<InscripcionResponse>> GetByMiembro(int miembroId)
        {
            var inscripciones = await _query.GetByMiembro(miembroId);

            var response = inscripciones.Select(i => new InscripcionResponse
            {
                Id = i.Id,
                MiembroId = i.MiembroId,
                MiembroNombre = i.Miembro.Nombre,
                MiembroApellido = i.Miembro.Apellido,
                ClaseId = i.ClaseId,
                ClaseNombre = i.Clase.Nombre,
                ClaseDia = i.Clase.Dia,
                ClaseHoraInicio = i.Clase.HoraInicio,
                ClaseHoraFin = i.Clase.HoraFin,
                FechaInscripcion = i.FechaInscripcion
            }).ToList();

            return response;
        }

        public async Task<List<InscripcionResponse>> GetByClase(int claseId)
        {
            var inscripciones = await _query.GetByClase(claseId);

            var response = inscripciones.Select(i => new InscripcionResponse
            {
                Id = i.Id,
                MiembroId = i.MiembroId,
                MiembroNombre = i.Miembro.Nombre,
                MiembroApellido = i.Miembro.Apellido,
                ClaseId = i.ClaseId,
                ClaseNombre = i.Clase.Nombre,
                ClaseDia = i.Clase.Dia,
                ClaseHoraInicio = i.Clase.HoraInicio,
                ClaseHoraFin = i.Clase.HoraFin,
                FechaInscripcion = i.FechaInscripcion
            }).ToList();

            return response;
        }
        public async Task Delete(int id)
        {
            var inscripcion = await _query.GetById(id);

            if (inscripcion == null)
                throw new NotFoundException("Asistencia no encontrada");

            await _command.Delete(inscripcion);
        }
    }
}
