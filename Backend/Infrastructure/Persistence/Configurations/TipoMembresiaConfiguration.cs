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
    public class TipoMembresiaConfiguration : IEntityTypeConfiguration<TipoMembresia>
    {
        public void Configure(EntityTypeBuilder<TipoMembresia> builder)
        {
            builder.ToTable("TipoMembresia");
            builder.HasKey(tm => tm.Id);
            builder.Property(tm => tm.Id).ValueGeneratedOnAdd();
            builder.Property(tm => tm.Nombre).IsRequired();
            builder.Property(tm => tm.DuracionDias).IsRequired();
            builder.Property(tm => tm.Costo).IsRequired();

            builder.HasMany(tm => tm.Membresias)
            .WithOne(m => m.TipoMembresia)
            .HasForeignKey(m => m.TipoMembresiaId)
            .IsRequired();

            builder.HasData(
                new TipoMembresia { Id = 1, Nombre = "Mensual", DuracionDias = 30, Costo = 15000 },
                new TipoMembresia { Id = 2, Nombre = "Trimestral", DuracionDias = 90, Costo = 40000 },
                new TipoMembresia { Id = 3, Nombre = "Anual", DuracionDias = 365, Costo = 140000 }
                );
        }
    }
}
