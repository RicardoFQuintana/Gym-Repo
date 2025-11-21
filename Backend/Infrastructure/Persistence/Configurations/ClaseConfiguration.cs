using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Configurations
{
    public class ClaseConfiguration : IEntityTypeConfiguration<Clase>
    {
        public void Configure(EntityTypeBuilder<Clase> builder)
        {
            builder.ToTable("Clase");
            builder.HasKey(c => c.Id);
            builder.Property(c => c.Id).ValueGeneratedOnAdd();
            builder.Property(c => c.Nombre).IsRequired();
            builder.Property(c => c.Cupo).IsRequired();
            builder.Property(c => c.HoraInicio).IsRequired();
            builder.Property(c => c.HoraFin).IsRequired();

            builder.HasMany(c => c.Inscripciones)
                .WithOne(i => i.Clase)
                .HasForeignKey(i => i.ClaseId)
                .IsRequired();

            builder.HasMany(c => c.Asistencias)
                .WithOne(a => a.Clase)
                .HasForeignKey(a => a.ClaseId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired(false);

           builder.HasData(
                new Clase { Id = 1, Nombre = "Zumba Inicial", Cupo = 20, Dia = DayOfWeek.Monday, HoraInicio = new TimeSpan(18, 0, 0), HoraFin = new TimeSpan(19, 0, 0), EntrenadorId = 2, ActividadId = 1 },
                new Clase { Id = 2, Nombre = "CrossFit Intermedio", Cupo = 15, Dia = DayOfWeek.Tuesday, HoraInicio = new TimeSpan(19, 0, 0), HoraFin = new TimeSpan(20, 0, 0), EntrenadorId = 1, ActividadId = 2 },
                new Clase { Id = 3, Nombre = "Yoga Avanzado", Cupo = 10, Dia = DayOfWeek.Wednesday, HoraInicio = new TimeSpan(17, 0, 0), HoraFin = new TimeSpan(18, 0, 0), EntrenadorId = 3, ActividadId = 3 },
                new Clase { Id = 4, Nombre = "Spinning Cardio", Cupo = 12, Dia = DayOfWeek.Thursday, HoraInicio = new TimeSpan(18, 0, 0), HoraFin = new TimeSpan(19, 0, 0), EntrenadorId = 5, ActividadId = 4 },
                new Clase { Id = 5, Nombre = "Funcional Full", Cupo = 18, Dia = DayOfWeek.Friday, HoraInicio = new TimeSpan(19, 0, 0), HoraFin = new TimeSpan(20, 0, 0), EntrenadorId = 4, ActividadId = 2 },
                new Clase { Id = 6, Nombre = "Yoga Relax", Cupo = 8, Dia = DayOfWeek.Saturday, HoraInicio = new TimeSpan(10, 0, 0), HoraFin = new TimeSpan(11, 0, 0), EntrenadorId = 3, ActividadId = 3 }
                );
        }
    }
}
