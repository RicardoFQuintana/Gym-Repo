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
    public class MiembroConfiguration : IEntityTypeConfiguration<Miembro>
    {
        public void Configure(EntityTypeBuilder<Miembro> builder)
        {
            builder.UseTpcMappingStrategy();

            builder.ToTable("Miembro");
            builder.HasKey(m => m.Id);
            builder.Property(m => m.Id).ValueGeneratedOnAdd();

            builder.HasOne(m => m.Entrenador)
                .WithMany(e => e.Miembros)
                .HasForeignKey(m => m.EntrenadorId)
                .IsRequired(false);

            builder.HasMany(m => m.Inscripciones)
                .WithOne(i => i.Miembro)
                .HasForeignKey(i => i.MiembroId)
                .IsRequired();

            builder.HasMany(m => m.Asistencias)
                .WithOne(a => a.Miembro)
                .HasForeignKey(a => a.MiembroId)
                .IsRequired();

            builder.HasIndex(m => m.Dni).IsUnique();
        }
    }
}
