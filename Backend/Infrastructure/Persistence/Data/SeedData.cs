using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace Infrastructure.Persistence.Data
{
    public static class SeedData
    {
        public static void AplicarDatos(this ModelBuilder modelBuilder)
        {
            var miembros = new List<Miembro>();
            var membresias = new List<Membresia>();
            var pagos = new List<Pago>();
            var tickets = new List<Ticket>();
            var inscripciones = new List<Inscripcion>();
            var asistencias = new List<Asistencia>();

            var rnd = new Random(42);
            int idMiembro = 1;
            int idMembresia = 1;
            int idPago = 1;
            int idTicket = 1;
            int idInscripcion = 1;
            int idAsistencia = 1;

            // Lista de nombres realistas
            var nombres = new[]
            {
                "Juan", "Lucía", "Carlos", "Mariana", "Diego", "Sofía", "Martín", "Camila", "Federico", "Valentina",
                "Gonzalo", "Carolina", "Andrés", "Florencia", "Pablo", "Agustina", "Sebastián", "Ana", "Tomás", "Laura",
                "Ricardo", "Gabriela", "Nicolás", "Sabrina", "Bruno"
            };
            var apellidos = new[]
            {
                "Gómez","Ramírez","Fernández","López","Pérez","Martínez","García","Sosa","Vargas","Silva",
                "Rodríguez","Torres","Alvarez","Molina","Herrera","Rossi","Domínguez","Ruiz","Ortiz","Iglesias",
                "Castro","Díaz","Páez","Suárez","Méndez"
            };

            for (int i = 0; i < 25; i++)
            {
                var nombre = nombres[i];
                var apellido = apellidos[i];
                int descuentoId = (i % 3) + 1;            // 1..3 circular
                int tipoMembresiaId = (i % 3) + 1;        // 1..3 circular
                int claseId = (i % 6) + 1;                // 1..6 circular

                decimal costo = tipoMembresiaId switch
                {
                    1 => 15000m,
                    2 => 40000m,
                    3 => 140000m,
                    _ => 15000m
                };

                // Miembro
                miembros.Add(new Miembro
                {
                    Id = idMiembro,
                    Nombre = nombre,
                    Apellido = apellido,
                    Dni = 41000000 + idMiembro,
                    // opcionales: Direccion, Telefono, FechaNacimiento
                    Direccion = $"Calle {100 + idMiembro}",
                    Telefono = 110000000 + idMiembro,
                    FechaNacimiento = new DateTime(1990, 1, 1).AddDays(idMiembro * 365 % 10000),
                    // DescuentoId (FK)
                    DescuentoId = descuentoId,
                    UrlFoto = $"https://randomuser.me/api/portraits/men/{i}.jpg"
                });

                // Membresia (1 por miembro)
                membresias.Add(new Membresia
                {
                    Id = idMembresia,
                    MiembroId = idMiembro,
                    TipoMembresiaId = tipoMembresiaId,
                    CostoFinal = costo,
                    FechaInicio = new DateTime(2025, 1, 1).AddDays(idMiembro),
                    FechaVencimiento = new DateTime(2025, 1, 1).AddDays(idMiembro + (tipoMembresiaId == 1 ? 30 : tipoMembresiaId == 2 ? 90 : 365))
                });

                // Pago (uno por membresia)
                pagos.Add(new Pago
                {
                    Id = idPago,
                    MembresiaId = idMembresia,
                    Monto = costo,
                    Fecha = new DateTime(2025, 1, 1).AddDays(idMiembro),
                    MetodoPago = (Domain.Enums.MetodoPago)(idMiembro % 4) // rotar métodos
                });

                // Ticket (detalle detallado)
                var metodoStr = ((Domain.Enums.MetodoPago)(idMiembro % 4)).ToString();
                var fechaPago = new DateTime(2025, 1, 1).AddDays(idMiembro);
                tickets.Add(new Ticket
                {
                    Id = idTicket,
                    PagoId = idPago,
                    FechaEmision = fechaPago,
                    Detalle = $"Pago registrado el {fechaPago:yyyy-MM-dd} por {nombre} {apellido}. Monto: ${costo:N0}. Método: {metodoStr}."
                });

                // Inscripcion a clase
                inscripciones.Add(new Inscripcion
                {
                    Id = idInscripcion,
                    MiembroId = idMiembro,
                    ClaseId = claseId,
                    FechaInscripcion = new DateTime(2025, 2, 1).AddDays(idMiembro % 10)
                });

                // Asistencia asociada (marcamos asistencia en una fecha posterior a la inscripción)
                asistencias.Add(new Asistencia
                {
                    Id = idAsistencia,
                    MiembroId = idMiembro,
                    ClaseId = claseId,
                    Fecha = new DateTime(2025, 2, 5).AddDays(idMiembro % 10)
                });

                // incrementar IDs
                idMiembro++; idMembresia++; idPago++; idTicket++; idInscripcion++; idAsistencia++;
            }

            modelBuilder.Entity<Miembro>().HasData(miembros);
            modelBuilder.Entity<Membresia>().HasData(membresias);
            modelBuilder.Entity<Pago>().HasData(pagos);
            modelBuilder.Entity<Ticket>().HasData(tickets);
            modelBuilder.Entity<Inscripcion>().HasData(inscripciones);
            modelBuilder.Entity<Asistencia>().HasData(asistencias);
        }
    }
}
