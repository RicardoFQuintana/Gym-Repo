using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Interfaces.IQuerys;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Queries
{
    public class ReporteQuery : IReporteQuery
    {
        private readonly AppDbContext _context;

        public ReporteQuery(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ReporteIngresosResponse> ObtenerReporteIngresos(ReporteFilterRequest filter)
        {
            var now = DateTime.Now;

            // Si el usuario no pasó fechas pero sí un periodo (diario, mensual, anual)
            if (!filter.FechaInicio.HasValue && !filter.FechaFin.HasValue && !string.IsNullOrEmpty(filter.Periodo))
            {
                switch (filter.Periodo.ToLower())
                {
                    case "diario":
                        filter.FechaInicio = now.Date;
                        filter.FechaFin = now.Date.AddDays(1).AddTicks(-1);
                        break;

                    case "mensual":
                        filter.FechaInicio = new DateTime(now.Year, now.Month, 1);
                        filter.FechaFin = filter.FechaInicio.Value.AddMonths(1).AddTicks(-1);
                        break;

                    case "anual":
                        filter.FechaInicio = new DateTime(now.Year, 1, 1);
                        filter.FechaFin = new DateTime(now.Year, 12, 31, 23, 59, 59);
                        break;
                }
            }

            var query = _context.Pagos
                .Include(p => p.Membresia)
                .ThenInclude(m => m.TipoMembresia)
                .AsQueryable();

            if (filter.FechaInicio.HasValue)
                query = query.Where(p => p.Fecha >= filter.FechaInicio.Value);

            if (filter.FechaFin.HasValue)
                query = query.Where(p => p.Fecha <= filter.FechaFin.Value);

            if (!string.IsNullOrEmpty(filter.Tipo))
                query = query.Where(p => p.Membresia.TipoMembresia.Nombre == filter.Tipo);

            var resultado = await query
                .GroupBy(p => p.Membresia.TipoMembresia.Nombre)
                .Select(g => new ReporteRegistro
                {
                    Clave = g.Key,
                    Valor = g.Sum(p => p.Monto)
                })
                .ToListAsync();

            return new ReporteIngresosResponse
            {
                Periodo = $"{filter.FechaInicio?.ToShortDateString()} - {filter.FechaFin?.ToShortDateString()}",
                Registros = resultado
            };
        }

        public async Task<ReporteAsistenciaResponse> ObtenerReporteAsistencia(ReporteFilterRequest filter)
        {
            var now = DateTime.Now;

            // Determinar rango por Periodo (si no se pasan fechas)
            if (!filter.FechaInicio.HasValue && !filter.FechaFin.HasValue && !string.IsNullOrEmpty(filter.Periodo))
            {
                switch (filter.Periodo.ToLower())
                {
                    case "diario":
                        filter.FechaInicio = now.Date;
                        filter.FechaFin = now.Date.AddDays(1).AddTicks(-1);
                        break;
                    case "mensual":
                        filter.FechaInicio = new DateTime(now.Year, now.Month, 1);
                        filter.FechaFin = filter.FechaInicio.Value.AddMonths(1).AddTicks(-1);
                        break;
                    case "anual":
                        filter.FechaInicio = new DateTime(now.Year, 1, 1);
                        filter.FechaFin = new DateTime(now.Year, 12, 31, 23, 59, 59);
                        break;
                }
            }

            var query = _context.Asistencias
                .Include(a => a.Clase)
                .ThenInclude(c => c.Actividad)
                .Include(a => a.Miembro)
                .AsQueryable();

            if (filter.FechaInicio.HasValue)
                query = query.Where(a => a.Fecha >= filter.FechaInicio.Value);

            if (filter.FechaFin.HasValue)
                query = query.Where(a => a.Fecha <= filter.FechaFin.Value);

            if (filter.MiembroId.HasValue)
                query = query.Where(a => a.MiembroId == filter.MiembroId.Value);

            if (filter.ClaseId.HasValue)
                query = query.Where(a => a.ClaseId == filter.ClaseId.Value);

            // Agrupar: si se pidió una clase específica, agrupamos por miembro
            // si no, agrupamos por actividad (como resumen general)
            var resultado = await query
                .GroupBy(a => filter.ClaseId.HasValue
                    ? (a.Miembro.Nombre + " " + a.Miembro.Apellido)
                    : a.Clase.Actividad.Nombre)
                .Select(g => new ReporteRegistro
                {
                    Clave = g.Key,
                    Valor = g.Count()
                })
                .ToListAsync();

            return new ReporteAsistenciaResponse
            {
                Periodo = $"{filter.FechaInicio?.ToShortDateString()} - {filter.FechaFin?.ToShortDateString()}",
                Registros = resultado
            };
        }

        public async Task<ReporteFinancieroResponse> ObtenerReporteFinanciero(ReporteFilterRequest filter)
        {
            var query = _context.Pagos.AsQueryable();

            if (filter.FechaInicio.HasValue)
                query = query.Where(p => p.Fecha >= filter.FechaInicio.Value);

            if (filter.FechaFin.HasValue)
                query = query.Where(p => p.Fecha <= filter.FechaFin.Value);

            var pagos = await query.ToListAsync();

            if (!pagos.Any())
                return new ReporteFinancieroResponse
                {
                    Total = 0,
                    Detalle = new List<ReporteRegistro>()
                };

            // Agrupamiento por período
            IEnumerable<IGrouping<string, Domain.Entities.Pago>> grupos;

            switch (filter.Periodo?.ToLower())
            {
                case "diario":
                    grupos = pagos.GroupBy(p => p.Fecha.ToString("dd/MM/yyyy"));
                    break;
                case "anual":
                    grupos = pagos.GroupBy(p => p.Fecha.Year.ToString());
                    break;
                default: // mensual
                    grupos = pagos.GroupBy(p => $"{p.Fecha.Month}/{p.Fecha.Year}");
                    break;
            }

            var detalle = grupos.Select(g => new ReporteRegistro
            {
                Clave = g.Key,
                Valor = g.Sum(p => p.Monto)
            }).ToList();

            return new ReporteFinancieroResponse
            {
                Total = pagos.Sum(p => p.Monto),
                Detalle = detalle
            };
        }
    }
}