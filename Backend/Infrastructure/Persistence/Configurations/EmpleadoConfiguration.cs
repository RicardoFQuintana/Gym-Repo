using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.Configurations
{
    public class EmpleadoConfiguration : IEntityTypeConfiguration<Empleado>
    {
        public void Configure(EntityTypeBuilder<Empleado> builder)
        {
            builder.ToTable("Empleados");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();

            builder.Property(e => e.Usuario)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(e => e.PasswordHash)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(e => e.Rol)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(e => e.Activo)
                .IsRequired();

            builder.HasIndex(e => e.Usuario)
                .IsUnique();

            builder.HasData(new Empleado
            {
                Id = 1,
                Usuario = "admin",
                PasswordHash = "$2a$12$DuwymARFebDA7JnbmuknHuxr78z6uUj5cSvtnqfEwo1Ydawp.fgfm",
                Rol = "Admin",
                Activo = true
            });
        }
    }
}

