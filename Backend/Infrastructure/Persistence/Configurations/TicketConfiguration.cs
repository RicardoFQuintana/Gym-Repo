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
    public class TicketConfiguration : IEntityTypeConfiguration<Ticket>
    {
        public void Configure(EntityTypeBuilder<Ticket> builder)
        {
            builder.ToTable("Ticket");
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Id).ValueGeneratedOnAdd();
            builder.Property(t => t.FechaEmision).IsRequired();
            builder.Property(t => t.Detalle).IsRequired();

            builder.HasOne(t => t.Pago)
                .WithOne(p => p.Ticket)
                .HasForeignKey<Ticket>(t => t.PagoId)
                .IsRequired();
        }
    }
}
