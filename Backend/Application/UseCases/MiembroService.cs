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
    public class MiembroService : IMiembroService
    {
        private readonly IMiembroQuery _query;
        private readonly IMiembroCommand _command;
        private readonly IDescuentoService _descuentoService;
        private readonly ITipoMembresiaService _tipoMembresiaService;
        private readonly IEntrenadorService _entrenadorService;

        public MiembroService(IMiembroQuery query, IMiembroCommand command, IDescuentoService descuentoService, ITipoMembresiaService tipoMembresiaService, IEntrenadorService entrenadorService)
        {
            _query = query;
            _command = command;
            _descuentoService = descuentoService;
            _tipoMembresiaService = tipoMembresiaService;
            _entrenadorService = entrenadorService;

        }

        public async Task<MiembroResponse> Add(MiembroAddRequest request)
        {
            if (await _query.ExisteDni(request.Dni))
                throw new ConflictException("Ya existe un miembro con el DNI ingresado");

            var tipoMembresia = await _tipoMembresiaService.GetById(request.TipoMembresiaId);

            decimal costo = tipoMembresia.Costo;
            int duracionDias = tipoMembresia.DuracionDias;
            decimal porcentajeDescuento = (await _descuentoService.GetById(request.DescuentoId)).Porcentaje;
            decimal costoFinal = costo - (costo * porcentajeDescuento);

            var pago = new Pago
            {
                Monto = costoFinal,
                Fecha = DateTime.Now,
                MetodoPago = (MetodoPago)request.MetodoPagoId,
                Ticket = new Ticket
                {
                    FechaEmision = DateTime.Now,
                    Detalle = $"Pago inicial de membresía del miembro {request.Nombre} {request.Apellido}"
                }
            };

            var miembro = new Miembro
            {
                Nombre = request.Nombre,
                Apellido = request.Apellido,
                Dni = request.Dni,
                Direccion = request.Direccion,
                Telefono = request.Telefono,
                FechaNacimiento = request.FechaNacimiento,
                UrlFoto = request.UrlFoto,
                DescuentoId = request.DescuentoId,

                Membresia = new Membresia
                {
                    TipoMembresiaId = request.TipoMembresiaId,
                    CostoFinal = costoFinal,
                    FechaInicio = DateTime.Now.Date,
                    FechaVencimiento = DateTime.Now.Date.AddDays(duracionDias),
                    Pagos = new List<Pago> { pago }
                },

                Inscripciones = new List<Inscripcion>(),
                Asistencias = new List<Asistencia>()
            };

            await _command.Add(miembro);

            var response = new MiembroResponse
            {
                Id = miembro.Id,
                Nombre = miembro.Nombre,
                Apellido = miembro.Apellido,
                Dni = miembro.Dni,
                Direccion = miembro.Direccion,
                Telefono = miembro.Telefono,
                FechaNacimiento = miembro.FechaNacimiento,
                UrlFoto = miembro.UrlFoto,
                Descuento = miembro.Descuento.Nombre,

                Membresia = new MembresiaResponse
                {
                    Id = miembro.Membresia.Id,
                    FechaInicio = miembro.Membresia.FechaInicio,
                    FechaVencimiento = miembro.Membresia.FechaVencimiento,
                    Pagos = miembro.Membresia.Pagos.Select(p => new PagoResponse
                    {
                        Id = p.Id,
                        Monto = p.Monto,
                        Fecha = p.Fecha,
                        MetodoPago = p.MetodoPago.ToString(),

                        Ticket = new TicketResponse
                        {
                            Id = p.Ticket.Id,
                            FechaEmision = p.Ticket.FechaEmision,
                            Detalle = p.Ticket.Detalle
                        }

                    }).ToList()
                },
            };

            return response;
        }

        public async Task<List<MiembroResponse>> GetAll()
        {
            var miembros = await _query.GetAll();

            var response = miembros.Select(m => new MiembroResponse
            {
                Id = m.Id,
                Nombre = m.Nombre,
                Apellido = m.Apellido,
                Dni = m.Dni,
                Direccion = m.Direccion,
                Telefono = m.Telefono,
                FechaNacimiento = m.FechaNacimiento,
                UrlFoto = m.UrlFoto,
                Descuento = m.Descuento.Nombre,


                Membresia = new MembresiaResponse
                {
                    Id = m.Membresia.Id,
                    MiembroId = m.Membresia.MiembroId,
                    TipoMembresiaId = m.Membresia.TipoMembresiaId,
                    FechaInicio = m.Membresia.FechaInicio,
                    FechaVencimiento = m.Membresia.FechaVencimiento,
                    Pagos = m.Membresia.Pagos.Select(p => new PagoResponse
                    {
                        Id = p.Id,
                        Monto = p.Monto,
                        Fecha = p.Fecha,
                        MetodoPago = p.MetodoPago.ToString(),

                        Ticket = new TicketResponse
                        {
                            Id = p.Ticket.Id,
                            FechaEmision = p.Ticket.FechaEmision,
                            Detalle = p.Ticket.Detalle
                        }

                    }).ToList()
                },

            }).ToList();

            return response;
        }

        public async Task<MiembroResponse> GetById(int id)
        {
            var miembro = await _query.GetById(id);

            if (miembro == null)
                throw new NotFoundException("Miembro no encontrado");

            var response = new MiembroResponse
            {
                Nombre = miembro.Nombre,
                Apellido = miembro.Apellido,
                Dni = miembro.Dni,
                Direccion = miembro.Direccion,
                Telefono = miembro.Telefono,
                FechaNacimiento = miembro.FechaNacimiento,
                UrlFoto = miembro.UrlFoto,
                Descuento = miembro.Descuento.Nombre,

                Membresia = new MembresiaResponse
                {
                    Id = miembro.Membresia.Id,
                    MiembroId = miembro.Membresia.MiembroId,
                    TipoMembresiaId = miembro.Membresia.TipoMembresiaId,
                    FechaInicio = miembro.Membresia.FechaInicio,
                    FechaVencimiento = miembro.Membresia.FechaVencimiento,
                    Pagos = miembro.Membresia.Pagos.Select(p => new PagoResponse
                    {
                        Id = p.Id,
                        Monto = p.Monto,
                        Fecha = p.Fecha,
                        MetodoPago = p.MetodoPago.ToString(),

                        Ticket = new TicketResponse
                        {
                            Id = p.Ticket.Id,
                            FechaEmision = p.Ticket.FechaEmision,
                            Detalle = p.Ticket.Detalle
                        }

                    }).ToList()
                },
            };

            return response;
        }

        public async Task<MiembroResponse> Update(int id, MiembroUpdateRequest request)
        {
            var miembro = await _query.GetById(id);

            if (miembro == null)
                throw new NotFoundException("Miembro no encontrado");

            miembro.Nombre = request.Nombre;
            miembro.Apellido = request.Apellido;
            miembro.Dni = request.Dni;
            miembro.Direccion = request.Direccion;
            miembro.Telefono = request.Telefono;
            miembro.FechaNacimiento = request.FechaNacimiento;
            miembro.UrlFoto = request.UrlFoto;

            await _command.Update(miembro);

            var response = new MiembroResponse
            {
                Nombre = miembro.Nombre,
                Apellido = miembro.Apellido,
                Dni = miembro.Dni,
                Direccion = miembro.Direccion,
                Telefono = miembro.Telefono,
                FechaNacimiento = miembro.FechaNacimiento,
                UrlFoto = miembro.UrlFoto,
                Descuento = miembro.Descuento.Nombre,

                Membresia = new MembresiaResponse
                {
                    Id = miembro.Membresia.Id,
                    FechaInicio = miembro.Membresia.FechaInicio,
                    FechaVencimiento = miembro.Membresia.FechaVencimiento,
                    Pagos = miembro.Membresia.Pagos.Select(p => new PagoResponse
                    {
                        Id = p.Id,
                        Monto = p.Monto,
                        Fecha = p.Fecha,
                        MetodoPago = p.MetodoPago.ToString(),

                        Ticket = new TicketResponse
                        {
                            Id = p.Ticket.Id,
                            FechaEmision = p.Ticket.FechaEmision,
                            Detalle = p.Ticket.Detalle
                        }

                    }).ToList()
                },
            };

            return response;
        }

        public async Task Delete(int id)
        {
            var miembro = await _query.GetById(id);

            if (miembro == null)
                throw new NotFoundException("Miembro no encontrado");

            await _command.Delete(miembro);
        }
        public async Task AsignarEntrenador(int miembroId, int entrenadorId)
        {
            var miembro = await _query.GetById(miembroId);
            if (miembro == null)
                throw new NotFoundException("Miembro no encontrado");
            var entrenador = await _entrenadorService.GetById(entrenadorId);
            if (entrenador == null)
                throw new NotFoundException("Entrenador no encontrado");
            miembro.EntrenadorId = entrenadorId;
            await _command.Update(miembro);
        }

    }
}
