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
    public class AsistenciaConfiguration : IEntityTypeConfiguration<Asistencia>
    {
        public void Configure(EntityTypeBuilder<Asistencia> builder)
        {
            builder.ToTable("Asistencia");
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Id).ValueGeneratedOnAdd();
            builder.Property(a => a.Fecha).IsRequired();
        }
    }
}
