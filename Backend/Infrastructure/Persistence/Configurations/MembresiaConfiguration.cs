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
    public class MembresiaConfiguration : IEntityTypeConfiguration<Membresia>
    {
        public void Configure(EntityTypeBuilder<Membresia> builder)
        {
            builder.ToTable("Membresia");
            builder.HasKey(m => m.Id);
            builder.Property(m => m.Id).ValueGeneratedOnAdd();
            builder.Property(m => m.CostoFinal).IsRequired();
            builder.Property(m => m.FechaInicio).IsRequired();
            builder.Property(m => m.FechaVencimiento).IsRequired();

            builder.HasOne(m => m.Miembro)
            .WithOne(mi => mi.Membresia)
            .HasForeignKey<Membresia>(m => m.MiembroId)
            .IsRequired();

            builder.HasMany(m => m.Pagos)
            .WithOne(p => p.Membresia)
            .HasForeignKey(p => p.MembresiaId)
            .IsRequired();
        }
    }
}
