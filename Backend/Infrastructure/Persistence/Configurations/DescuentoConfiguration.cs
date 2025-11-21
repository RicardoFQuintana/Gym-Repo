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
    public class DescuentoConfiguration : IEntityTypeConfiguration<Descuento>
    {
        public void Configure(EntityTypeBuilder<Descuento> builder)
        {
            builder.ToTable("Descuento");
            builder.HasKey(d => d.Id);
            builder.Property(d => d.Id).ValueGeneratedOnAdd();
            builder.Property(d => d.Nombre).IsRequired();
            builder.Property(d => d.Porcentaje).IsRequired();

            builder.HasMany(d => d.Miembros)
                .WithOne(m => m.Descuento)
                .HasForeignKey(m => m.DescuentoId)
                .IsRequired();

            builder.HasIndex(d => d.Nombre).IsUnique();

            builder.HasData(
                new Descuento { Id = 1, Nombre = "Estudiante", Porcentaje = 0.10m },
                new Descuento { Id = 2, Nombre = "Jubilado", Porcentaje = 0.15m },
                new Descuento { Id = 3, Nombre = "Grupo Familiar", Porcentaje = 0.20m }
                );
        }
    }
}
