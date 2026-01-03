using Domain.Entities;
using Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Infrastructure.Persistence
{
    // =============================
    // DbContext
    // =============================
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // =============================
        // DbSets
        // =============================
        public DbSet<Actividad> Actividades => Set<Actividad>();
        public DbSet<Asistencia> Asistencias => Set<Asistencia>();
        public DbSet<Clase> Clases => Set<Clase>();
        public DbSet<Descuento> Descuentos => Set<Descuento>();
        public DbSet<Empleado> Empleados => Set<Empleado>();
        public DbSet<Entrenador> Entrenadores => Set<Entrenador>();
        public DbSet<Inscripcion> Inscripciones => Set<Inscripcion>();
        public DbSet<Membresia> Membresias => Set<Membresia>();
        public DbSet<Miembro> Miembros => Set<Miembro>();
        public DbSet<Pago> Pagos => Set<Pago>();
        public DbSet<Ticket> Tickets => Set<Ticket>();
        public DbSet<TipoMembresia> TiposMembresia => Set<TipoMembresia>();

        // =============================
        // Model Creating
        // =============================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureBaseEntity(modelBuilder);

            ConfigureActividad(modelBuilder);
            ConfigureClase(modelBuilder);
            ConfigureEntrenador(modelBuilder);
            ConfigureMiembro(modelBuilder);
            ConfigureDescuento(modelBuilder);
            ConfigureInscripcion(modelBuilder);
            ConfigureAsistencia(modelBuilder);
            ConfigureMembresia(modelBuilder);
            ConfigurePago(modelBuilder);
            ConfigureTicket(modelBuilder);
            ConfigureTipoMembresia(modelBuilder);
            ConfigureEmpleado(modelBuilder);

            SeedData(modelBuilder);
        }

        // =====================================================
        // CONFIG BASE → PK AUTOINCREMENTAL
        // =====================================================
        private static void ConfigureBaseEntity(ModelBuilder modelBuilder)
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                if (entity.FindProperty("Id") != null)
                {
                    modelBuilder.Entity(entity.ClrType)
                        .HasKey("Id");

                    modelBuilder.Entity(entity.ClrType)
                        .Property("Id")
                        .ValueGeneratedOnAdd(); // 👈 PK AutoIncremental
                }
            }
        }

        // =====================================================
        // ACTIVIDAD
        // =====================================================
        private static void ConfigureActividad(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Actividad>(entity =>
            {
                entity.ToTable("Actividad");
                entity.Property(e => e.Nombre)
                      .IsRequired()
                      .HasMaxLength(100);
            });
        }

        // =====================================================
        // CLASE
        // =====================================================
        private static void ConfigureClase(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Clase>(entity =>
            {
                entity.ToTable("Clase");

                entity.HasOne(c => c.Entrenador)
                      .WithMany(e => e.Clases)
                      .HasForeignKey(c => c.EntrenadorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(c => c.Actividad)
                      .WithMany(a => a.Clases)
                      .HasForeignKey(c => c.ActividadId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        // =====================================================
        // ENTRENADOR
        // =====================================================
        private static void ConfigureEntrenador(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Entrenador>(entity =>
            {
                entity.ToTable("Entrenador");

                entity.Property(e => e.UrlCertificado)
                      .HasMaxLength(300);
            });
        }

        // =====================================================
        // MIEMBRO
        // =====================================================
        private static void ConfigureMiembro(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Miembro>(entity =>
            {
                entity.ToTable("Miembro");

                entity.HasOne(m => m.Entrenador)
                      .WithMany(e => e.Miembros)
                      .HasForeignKey(m => m.EntrenadorId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(m => m.Descuento)
                      .WithMany(d => d.Miembros)
                      .HasForeignKey(m => m.DescuentoId)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }

        // =====================================================
        // DESCUENTO
        // =====================================================
        private static void ConfigureDescuento(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Descuento>(entity =>
            {
                entity.ToTable("Descuento");

                entity.Property(d => d.Nombre)
                      .IsRequired()
                      .HasMaxLength(100);
            });
        }

        // =====================================================
        // INSCRIPCION
        // =====================================================
        private static void ConfigureInscripcion(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Inscripcion>(entity =>
            {
                entity.ToTable("Inscripcion");

                entity.HasOne(i => i.Miembro)
                      .WithMany(m => m.Inscripciones)
                      .HasForeignKey(i => i.MiembroId);

                entity.HasOne(i => i.Clase)
                      .WithMany(c => c.Inscripciones)
                      .HasForeignKey(i => i.ClaseId);
            });
        }

        // =====================================================
        // ASISTENCIA
        // =====================================================
        private static void ConfigureAsistencia(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Asistencia>(entity =>
            {
                entity.ToTable("Asistencia");

                entity.HasOne(a => a.Miembro)
                      .WithMany(m => m.Asistencias)
                      .HasForeignKey(a => a.MiembroId);

                entity.HasOne(a => a.Clase)
                      .WithMany(c => c.Asistencias)
                      .HasForeignKey(a => a.ClaseId)
                      .OnDelete(DeleteBehavior.SetNull);
            });
        }

        // =====================================================
        // MEMBRESIA
        // =====================================================
        private static void ConfigureMembresia(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Membresia>(entity =>
            {
                entity.ToTable("Membresia");

                entity.HasOne(m => m.Miembro)
                      .WithOne(mi => mi.Membresia)
                      .HasForeignKey<Membresia>(m => m.MiembroId);

                entity.HasOne(m => m.TipoMembresia)
                      .WithMany(t => t.Membresias)
                      .HasForeignKey(m => m.TipoMembresiaId);
            });
        }

        // =====================================================
        // PAGO
        // =====================================================
        private static void ConfigurePago(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Pago>(entity =>
            {
                entity.ToTable("Pago");

                entity.HasOne(p => p.Membresia)
                      .WithMany(m => m.Pagos)
                      .HasForeignKey(p => p.MembresiaId);
            });
        }

        // =====================================================
        // TICKET
        // =====================================================
        private static void ConfigureTicket(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Ticket>(entity =>
            {
                entity.ToTable("Ticket");

                entity.HasOne(t => t.Pago)
                      .WithOne(p => p.Ticket)
                      .HasForeignKey<Ticket>(t => t.PagoId);
            });
        }

        // =====================================================
        // TIPO MEMBRESIA
        // =====================================================
        private static void ConfigureTipoMembresia(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<TipoMembresia>(entity =>
            {
                entity.ToTable("TipoMembresia");

                entity.Property(t => t.Nombre)
                      .IsRequired()
                      .HasMaxLength(100);
            });
        }

        // =====================================================
        // EMPLEADO
        // =====================================================
        private static void ConfigureEmpleado(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Empleado>(entity =>
            {
                entity.ToTable("Empleado");

                entity.Property(e => e.Usuario).IsRequired();
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Rol).IsRequired();
            });
        }

        // =====================================================
        // SEED DATA (SEGURO)
        // =====================================================
        private static void SeedData(ModelBuilder modelBuilder)
        {
            // =============================
            // TIPO MEMBRESIA
            // =============================
            modelBuilder.Entity<TipoMembresia>().HasData(
                new TipoMembresia { Id = 1, Nombre = "Mensual", DuracionDias = 30, Costo = 15000 },
                new TipoMembresia { Id = 2, Nombre = "Trimestral", DuracionDias = 90, Costo = 40000 },
                new TipoMembresia { Id = 3, Nombre = "Anual", DuracionDias = 365, Costo = 140000 }
            );

            // =============================
            // DESCUENTOS
            // =============================
            modelBuilder.Entity<Descuento>().HasData(
                new Descuento { Id = 1, Nombre = "Estudiante", Porcentaje = 0.10m },
                new Descuento { Id = 2, Nombre = "Jubilado", Porcentaje = 0.15m },
                new Descuento { Id = 3, Nombre = "Grupo Familiar", Porcentaje = 0.20m }
            );

            // =============================
            // EMPLEADO ADMINISTRATIVO
            // =============================
            modelBuilder.Entity<Empleado>().HasData(
                new Empleado { Id = 1, Usuario = "admin", PasswordHash = "HASH", Rol = "Admin", Activo = true }
            );

            // =============================
            // ENTRENADORES
            // =============================
            modelBuilder.Entity<Entrenador>().HasData(
                new Entrenador { Id = 1, Nombre = "Pablo", Apellido = "Pérez", Dni = 42151500, UrlFoto = "https://randomuser.me/api/portraits/men/30.jpg" },
                new Entrenador { Id = 2, Nombre = "María", Apellido = "Fernandez", Dni = 29525462, UrlFoto = "https://randomuser.me/api/portraits/women/30.jpg" },
                new Entrenador { Id = 3, Nombre = "Lucas", Apellido = "García", Dni = 38252551, UrlFoto = "https://randomuser.me/api/portraits/men/31.jpg" },
                new Entrenador { Id = 4, Nombre = "Carla", Apellido = "González", Dni = 38962541, UrlFoto = "https://randomuser.me/api/portraits/women/31.jpg" },
                new Entrenador { Id = 5, Nombre = "Diego", Apellido = "Martínez", Dni = 40001555, UrlFoto = "https://randomuser.me/api/portraits/men/32.jpg" }
            );

            // =============================
            // ACTIVIDADES
            // =============================
            modelBuilder.Entity<Actividad>().HasData(
                new Actividad { Id = 1, Nombre = "Zumba", Descripcion = "Clase de ritmo y cardio" },
                new Actividad { Id = 2, Nombre = "CrossFit", Descripcion = "Entrenamiento funcional de alta intensidad" },
                new Actividad { Id = 3, Nombre = "Yoga", Descripcion = "Relajación y flexibilidad" },
                new Actividad { Id = 4, Nombre = "Spinning", Descripcion = "Ejercicio cardiovascular en bicicleta" }
            );

            // =============================
            // CLASES
            // =============================
            modelBuilder.Entity<Clase>().HasData(
                new Clase { Id = 1, Nombre = "Zumba Inicial", Cupo = 20, Dia = DayOfWeek.Monday, HoraInicio = new TimeSpan(18, 0, 0), HoraFin = new TimeSpan(19, 0, 0), EntrenadorId = 2, ActividadId = 1 },
                new Clase { Id = 2, Nombre = "CrossFit Intermedio", Cupo = 15, Dia = DayOfWeek.Tuesday, HoraInicio = new TimeSpan(19, 0, 0), HoraFin = new TimeSpan(20, 0, 0), EntrenadorId = 1, ActividadId = 2 },
                new Clase { Id = 3, Nombre = "Yoga Avanzado", Cupo = 10, Dia = DayOfWeek.Wednesday, HoraInicio = new TimeSpan(17, 0, 0), HoraFin = new TimeSpan(18, 0, 0), EntrenadorId = 3, ActividadId = 3 },
                new Clase { Id = 4, Nombre = "Spinning Cardio", Cupo = 12, Dia = DayOfWeek.Thursday, HoraInicio = new TimeSpan(18, 0, 0), HoraFin = new TimeSpan(19, 0, 0), EntrenadorId = 5, ActividadId = 4 },
                new Clase { Id = 5, Nombre = "Funcional Full", Cupo = 18, Dia = DayOfWeek.Friday, HoraInicio = new TimeSpan(19, 0, 0), HoraFin = new TimeSpan(20, 0, 0), EntrenadorId = 4, ActividadId = 2 },
                new Clase { Id = 6, Nombre = "Yoga Relax", Cupo = 8, Dia = DayOfWeek.Saturday, HoraInicio = new TimeSpan(10, 0, 0), HoraFin = new TimeSpan(11, 0, 0), EntrenadorId = 3, ActividadId = 3 }
            );

            // =============================
            // MIEMBROS / MEMBRESIAS / PAGOS / TICKETS / INSCRIPCIONES / ASISTENCIAS
            // =============================
            // 👉 Acá va EXACTAMENTE tu loop de 25 miembros
            var miembros = new List<Miembro>();
            var membresias = new List<Membresia>();
            var pagos = new List<Pago>();
            var tickets = new List<Ticket>();
            var inscripciones = new List<Inscripcion>();
            var asistencias = new List<Asistencia>();

            int idMiembro = 1;
            int idMembresia = 1;
            int idPago = 1;
            int idTicket = 1;
            int idInscripcion = 1;
            int idAsistencia = 1;

            // Lista de nombres realistas
            var nombres = new[]
            {
                "Juan", "Lucía", "Carlos", "Mariana", "Diego", "Sofía", "Martín", "Camila", "Federico", "Valentina",
                "Gonzalo", "Carolina", "Andrés", "Florencia", "Pablo", "Agustina", "Sebastián", "Ana", "Tomás", "Laura",
                "Ricardo", "Gabriela", "Nicolás", "Sabrina", "Bruno"
            };
            var apellidos = new[]
            {
                "Gómez","Ramírez","Fernández","López","Pérez","Martínez","García","Sosa","Vargas","Silva",
                "Rodríguez","Torres","Alvarez","Molina","Herrera","Rossi","Domínguez","Ruiz","Ortiz","Iglesias",
                "Castro","Díaz","Páez","Suárez","Méndez"
            };

            for (int i = 0; i < 25; i++)
            {
                var nombre = nombres[i];
                var apellido = apellidos[i];
                int descuentoId = (i % 3) + 1;            // 1..3 circular
                int tipoMembresiaId = (i % 3) + 1;        // 1..3 circular
                int claseId = (i % 6) + 1;                // 1..6 circular

                decimal costo = tipoMembresiaId switch
                {
                    1 => 15000m,
                    2 => 40000m,
                    3 => 140000m,
                    _ => 15000m
                };

                // Miembro
                miembros.Add(new Miembro
                {
                    Id = idMiembro,
                    Nombre = nombre,
                    Apellido = apellido,
                    Dni = 41000000 + idMiembro,
                    // opcionales: Direccion, Telefono, FechaNacimiento
                    Direccion = $"Calle {100 + idMiembro}",
                    Telefono = 110000000 + idMiembro,
                    FechaNacimiento = new DateTime(1990, 1, 1).AddDays(idMiembro * 365 % 10000),
                    // DescuentoId (FK)
                    DescuentoId = descuentoId,
                    UrlFoto = $"https://randomuser.me/api/portraits/men/{i}.jpg"
                });

                // Membresia (1 por miembro)
                membresias.Add(new Membresia
                {
                    Id = idMembresia,
                    MiembroId = idMiembro,
                    TipoMembresiaId = tipoMembresiaId,
                    CostoFinal = costo,
                    FechaInicio = new DateTime(2025, 1, 1).AddDays(idMiembro),
                    FechaVencimiento = new DateTime(2025, 1, 1).AddDays(idMiembro + (tipoMembresiaId == 1 ? 30 : tipoMembresiaId == 2 ? 90 : 365))
                });

                // Pago (uno por membresia)
                pagos.Add(new Pago
                {
                    Id = idPago,
                    MembresiaId = idMembresia,
                    Monto = costo,
                    Fecha = new DateTime(2025, 1, 1).AddDays(idMiembro),
                    MetodoPago = (Domain.Enums.MetodoPago)(idMiembro % 4) // rotar métodos
                });

                // Ticket (detalle detallado)
                var metodoStr = ((Domain.Enums.MetodoPago)(idMiembro % 4)).ToString();
                var fechaPago = new DateTime(2025, 1, 1).AddDays(idMiembro);
                tickets.Add(new Ticket
                {
                    Id = idTicket,
                    PagoId = idPago,
                    FechaEmision = fechaPago,
                    Detalle = $"Pago registrado el {fechaPago:yyyy-MM-dd} por {nombre} {apellido}. Monto: ${costo:N0}. Método: {metodoStr}."
                });

                // Inscripcion a clase
                inscripciones.Add(new Inscripcion
                {
                    Id = idInscripcion,
                    MiembroId = idMiembro,
                    ClaseId = claseId,
                    FechaInscripcion = new DateTime(2025, 2, 1).AddDays(idMiembro % 10)
                });

                // Asistencia asociada (marcamos asistencia en una fecha posterior a la inscripción)
                asistencias.Add(new Asistencia
                {
                    Id = idAsistencia,
                    MiembroId = idMiembro,
                    ClaseId = claseId,
                    Fecha = new DateTime(2025, 2, 5).AddDays(idMiembro % 10),
                    Metodo = (Domain.Enums.MetodoAsistencia)(idMiembro % 3)
                });

                // incrementar IDs
                idMiembro++; idMembresia++; idPago++; idTicket++; idInscripcion++; idAsistencia++;
            }

            modelBuilder.Entity<Miembro>().HasData(miembros);
            modelBuilder.Entity<Membresia>().HasData(membresias);
            modelBuilder.Entity<Pago>().HasData(pagos);
            modelBuilder.Entity<Ticket>().HasData(tickets);
            modelBuilder.Entity<Inscripcion>().HasData(inscripciones);
            modelBuilder.Entity<Asistencia>().HasData(asistencias);
        }
    }

    // =============================
    // FACTORY
    // =============================
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlServer("Server=localhost\\SQLEXPRESS;Database=GimnasioDB;Trusted_Connection=True;TrustServerCertificate=True;")
                .Options;

            return new AppDbContext(options);
        }
    }
}
