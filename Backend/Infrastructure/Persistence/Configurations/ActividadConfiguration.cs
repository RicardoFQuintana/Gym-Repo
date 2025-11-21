using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Persistence.Configurations
{
    public class ActividadConfiguration : IEntityTypeConfiguration<Actividad>
    {
        public void Configure(EntityTypeBuilder<Actividad> builder)
        {
            builder.ToTable("Actividad");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).ValueGeneratedOnAdd();
            builder.Property(a => a.Nombre).IsRequired();
            builder.Property(a => a.Descripcion);

            builder.HasMany(a => a.Clases)
                .WithOne(s => s.Actividad)
                .HasForeignKey(s => s.ActividadId)
                .IsRequired();

            builder.HasIndex(a => a.Nombre).IsUnique();

            builder.HasData(
                new Actividad { Id = 1, Nombre = "Zumba", Descripcion = "Clase de ritmo y cardio" },
                new Actividad { Id = 2, Nombre = "CrossFit", Descripcion = "Entrenamiento funcional de alta intensidad" },
                new Actividad { Id = 3, Nombre = "Yoga", Descripcion = "Relajación y flexibilidad" },
                new Actividad { Id = 4, Nombre = "Spinning", Descripcion = "Ejercicio cardiovascular en bicicleta" }
            );
        }
    }
}
