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
    public class EntrenadorConfiguration : IEntityTypeConfiguration<Entrenador>
    {
        public void Configure(EntityTypeBuilder<Entrenador> builder)
        {
            builder.UseTpcMappingStrategy();

            builder.ToTable("Entrenador");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).ValueGeneratedOnAdd();
            builder.Property(e => e.UrlCertificado).IsRequired(false);

            builder.HasMany(e => e.Clases)
                .WithOne(c => c.Entrenador)
                .HasForeignKey(c => c.EntrenadorId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            builder.HasIndex(e => e.Dni).IsUnique();

            builder.HasData(
                new Entrenador { Id = 1, Nombre = "Pablo", Apellido = "Pérez", Dni = 42151500, UrlFoto = "https://randomuser.me/api/portraits/men/30.jpg" },
                new Entrenador { Id = 2, Nombre = "María", Apellido = "Fernandez", Dni = 29525462, UrlFoto = "https://randomuser.me/api/portraits/women/30.jpg" },
                new Entrenador { Id = 3, Nombre = "Lucas", Apellido = "García", Dni = 38252551, UrlFoto = "https://randomuser.me/api/portraits/men/31.jpg" },
                new Entrenador { Id = 4, Nombre = "Carla", Apellido = "González", Dni = 38962541, UrlFoto = "https://randomuser.me/api/portraits/women/31.jpg" },
                new Entrenador { Id = 5, Nombre = "Diego", Apellido = "Martínez", Dni = 40001555, UrlFoto = "https://randomuser.me/api/portraits/men/32.jpg" }
                );
        }
    }
}
