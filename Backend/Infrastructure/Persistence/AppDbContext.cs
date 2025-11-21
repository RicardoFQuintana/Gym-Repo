using Domain.Entities;
using Domain.Enums;
using Infrastructure.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<Actividad> Actividades { get; set; }
        public DbSet<Asistencia> Asistencias { get; set; }
        public DbSet<Clase> Clases { get; set; }
        public DbSet<Descuento> Descuentos { get; set; }
        public DbSet<Entrenador> Entrenadores { get; set; }
        public DbSet<Inscripcion> Inscripciones { get; set; }
        public DbSet<Membresia> Membresias { get; set; }
        public DbSet<Miembro> Miembros { get; set; }
        public DbSet<Pago> Pagos { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TipoMembresia> TiposMembresia { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            modelBuilder.AplicarDatos();
        }
    }
}