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
    public class InscripcionConfiguration : IEntityTypeConfiguration<Inscripcion>
    {
        public void Configure(EntityTypeBuilder<Inscripcion> builder)
        {
            builder.ToTable("Inscripcion");
            builder.HasKey(i => i.Id);
            builder.Property(i => i.Id).ValueGeneratedOnAdd();
            builder.Property(i => i.FechaInscripcion).IsRequired();
        }
    }
}
