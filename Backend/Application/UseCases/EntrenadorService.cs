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
    public class EntrenadorService : IEntrenadorService
    {
        private readonly IEntrenadorQuery _query;
        private readonly IEntrenadorCommand _command;

        public EntrenadorService(IEntrenadorQuery query, IEntrenadorCommand command)
        {
            _query = query;
            _command = command;
        }

        public async Task Add(EntrenadorAddRequest request)
        {
            if (await _query.ExisteDni(request.Dni))
                throw new ConflictException("Ya existe un entrenador con el DNI ingresado");
            var entrenador = new Entrenador
            {
                Nombre = request.Nombre,
                Apellido = request.Apellido,
                Dni = request.Dni,
                Direccion = request.Direccion,
                Telefono = request.Telefono,
                FechaNacimiento = request.FechaNacimiento,
                UrlFoto = request.UrlFoto,
                UrlCertificado = request.UrlCertificado
            };

           await _command.Add(entrenador);
        }

        public async Task<List<EntrenadorResponse>> GetAll()
        {
            var entrenadores = await _query.GetAll();

            var response = entrenadores.Select(m => new EntrenadorResponse
            {
                Id = m.Id,
                Nombre = m.Nombre,
                Apellido = m.Apellido,
                Dni = m.Dni,
                Direccion = m.Direccion,
                Telefono = m.Telefono,
                FechaNacimiento = m.FechaNacimiento,
                UrlFoto = m.UrlFoto,
                Clases = m.Clases.Select(c => new ClaseSummaryResponse
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Dia = c.Dia,
                    HoraInicio = c.HoraInicio,
                    HoraFin = c.HoraFin
                }).ToList(),
                Miembros = m.Miembros.Select(mm => new MiembroSummaryResponse
                {
                    Id = mm.Id,
                    Nombre = mm.Nombre,
                    Apellido = mm.Apellido,
                    Dni = mm.Dni
                }).ToList(),
                UrlCertificado= m.UrlCertificado

            }).ToList();
            Console.WriteLine(response.Count);
            return response;
        }

        public async Task<EntrenadorResponse> GetById(int id)
        {
            var entrenador = await _query.GetById(id);

            if (entrenador == null)
                throw new NotFoundException("Entrenador no encontrado");

            var response = new EntrenadorResponse
            {
                Id = entrenador.Id,
                Nombre = entrenador.Nombre,
                Apellido = entrenador.Apellido,
                Dni = entrenador.Dni,
                Direccion = entrenador.Direccion,
                Telefono = entrenador.Telefono,
                FechaNacimiento = entrenador.FechaNacimiento,
                UrlFoto = entrenador.UrlFoto,
                UrlCertificado = entrenador.UrlCertificado,

                Clases = entrenador.Clases.Select(c => new ClaseSummaryResponse
                {
                    Id = c.Id,
                    Nombre = c.Nombre,
                    Dia = c.Dia,
                    HoraInicio = c.HoraInicio,
                    HoraFin = c.HoraFin
                }).ToList(),
                Miembros = entrenador.Miembros.Select(mm => new MiembroSummaryResponse
                {
                    Id = mm.Id,
                    Nombre = mm.Nombre,
                    Apellido = mm.Apellido,
                    Dni = mm.Dni
                }).ToList()
            };

            return response;
        }

        public async Task Update(int id, EntrenadorUpdateRequest request)
        {
            var entrenador = await _query.GetById(id);

            if (entrenador == null)
                throw new NotFoundException("Entrenador no encontrado");

            entrenador.Nombre = request.Nombre;
            entrenador.Apellido = request.Apellido;
            entrenador.Dni = request.Dni;
            entrenador.Direccion = request.Direccion;
            entrenador.Telefono = request.Telefono;
            entrenador.FechaNacimiento = request.FechaNacimiento;
            entrenador.UrlFoto = request.UrlFoto;
            entrenador.UrlCertificado = request.UrlCertificado;
            await _command.Update(entrenador);
        }

        public async Task Delete(int id)
        {
            var entrenador = await _query.GetById(id);

            if (entrenador == null)
                throw new NotFoundException("Entrenador no encontrado");

            await _command.Delete(entrenador);
        }
    }
}
