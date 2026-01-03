using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Actividad",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Actividad", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Descuento",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Porcentaje = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Descuento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Empleado",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Usuario = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Activo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleado", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entrenador",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UrlCertificado = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Apellido = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dni = table.Column<int>(type: "int", nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefono = table.Column<int>(type: "int", nullable: true),
                    FechaNacimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UrlFoto = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entrenador", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TipoMembresia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DuracionDias = table.Column<int>(type: "int", nullable: false),
                    Costo = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TipoMembresia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Clase",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Cupo = table.Column<int>(type: "int", nullable: false),
                    Dia = table.Column<int>(type: "int", nullable: false),
                    HoraInicio = table.Column<TimeSpan>(type: "time", nullable: false),
                    HoraFin = table.Column<TimeSpan>(type: "time", nullable: false),
                    EntrenadorId = table.Column<int>(type: "int", nullable: false),
                    ActividadId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clase", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Clase_Actividad_ActividadId",
                        column: x => x.ActividadId,
                        principalTable: "Actividad",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Clase_Entrenador_EntrenadorId",
                        column: x => x.EntrenadorId,
                        principalTable: "Entrenador",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Miembro",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DescuentoId = table.Column<int>(type: "int", nullable: false),
                    EntrenadorId = table.Column<int>(type: "int", nullable: true),
                    Nombre = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Apellido = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dni = table.Column<int>(type: "int", nullable: false),
                    Direccion = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Telefono = table.Column<int>(type: "int", nullable: true),
                    FechaNacimiento = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UrlFoto = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Miembro", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Miembro_Descuento_DescuentoId",
                        column: x => x.DescuentoId,
                        principalTable: "Descuento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Miembro_Entrenador_EntrenadorId",
                        column: x => x.EntrenadorId,
                        principalTable: "Entrenador",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Asistencia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MiembroId = table.Column<int>(type: "int", nullable: false),
                    ClaseId = table.Column<int>(type: "int", nullable: true),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Metodo = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Asistencia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Asistencia_Clase_ClaseId",
                        column: x => x.ClaseId,
                        principalTable: "Clase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Asistencia_Miembro_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembro",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Inscripcion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MiembroId = table.Column<int>(type: "int", nullable: false),
                    ClaseId = table.Column<int>(type: "int", nullable: false),
                    FechaInscripcion = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inscripcion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inscripcion_Clase_ClaseId",
                        column: x => x.ClaseId,
                        principalTable: "Clase",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Inscripcion_Miembro_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembro",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Membresia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MiembroId = table.Column<int>(type: "int", nullable: false),
                    TipoMembresiaId = table.Column<int>(type: "int", nullable: false),
                    CostoFinal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FechaInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaVencimiento = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Membresia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Membresia_Miembro_MiembroId",
                        column: x => x.MiembroId,
                        principalTable: "Miembro",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Membresia_TipoMembresia_TipoMembresiaId",
                        column: x => x.TipoMembresiaId,
                        principalTable: "TipoMembresia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Pago",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MembresiaId = table.Column<int>(type: "int", nullable: false),
                    Monto = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MetodoPago = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pago", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Pago_Membresia_MembresiaId",
                        column: x => x.MembresiaId,
                        principalTable: "Membresia",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ticket",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PagoId = table.Column<int>(type: "int", nullable: false),
                    FechaEmision = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Detalle = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ticket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ticket_Pago_PagoId",
                        column: x => x.PagoId,
                        principalTable: "Pago",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Actividad",
                columns: new[] { "Id", "Descripcion", "Nombre" },
                values: new object[,]
                {
                    { 1, "Clase de ritmo y cardio", "Zumba" },
                    { 2, "Entrenamiento funcional de alta intensidad", "CrossFit" },
                    { 3, "Relajación y flexibilidad", "Yoga" },
                    { 4, "Ejercicio cardiovascular en bicicleta", "Spinning" }
                });

            migrationBuilder.InsertData(
                table: "Descuento",
                columns: new[] { "Id", "Nombre", "Porcentaje" },
                values: new object[,]
                {
                    { 1, "Estudiante", 0.10m },
                    { 2, "Jubilado", 0.15m },
                    { 3, "Grupo Familiar", 0.20m }
                });

            migrationBuilder.InsertData(
                table: "Empleado",
                columns: new[] { "Id", "Activo", "PasswordHash", "Rol", "Usuario" },
                values: new object[] { 1, true, "HASH", "Admin", "admin" });

            migrationBuilder.InsertData(
                table: "Entrenador",
                columns: new[] { "Id", "Apellido", "Direccion", "Dni", "FechaNacimiento", "Nombre", "Telefono", "UrlCertificado", "UrlFoto" },
                values: new object[,]
                {
                    { 1, "Pérez", null, 42151500, null, "Pablo", null, null, "https://randomuser.me/api/portraits/men/30.jpg" },
                    { 2, "Fernandez", null, 29525462, null, "María", null, null, "https://randomuser.me/api/portraits/women/30.jpg" },
                    { 3, "García", null, 38252551, null, "Lucas", null, null, "https://randomuser.me/api/portraits/men/31.jpg" },
                    { 4, "González", null, 38962541, null, "Carla", null, null, "https://randomuser.me/api/portraits/women/31.jpg" },
                    { 5, "Martínez", null, 40001555, null, "Diego", null, null, "https://randomuser.me/api/portraits/men/32.jpg" }
                });

            migrationBuilder.InsertData(
                table: "TipoMembresia",
                columns: new[] { "Id", "Costo", "DuracionDias", "Nombre" },
                values: new object[,]
                {
                    { 1, 15000m, 30, "Mensual" },
                    { 2, 40000m, 90, "Trimestral" },
                    { 3, 140000m, 365, "Anual" }
                });

            migrationBuilder.InsertData(
                table: "Clase",
                columns: new[] { "Id", "ActividadId", "Cupo", "Dia", "EntrenadorId", "HoraFin", "HoraInicio", "Nombre" },
                values: new object[,]
                {
                    { 1, 1, 20, 1, 2, new TimeSpan(0, 19, 0, 0, 0), new TimeSpan(0, 18, 0, 0, 0), "Zumba Inicial" },
                    { 2, 2, 15, 2, 1, new TimeSpan(0, 20, 0, 0, 0), new TimeSpan(0, 19, 0, 0, 0), "CrossFit Intermedio" },
                    { 3, 3, 10, 3, 3, new TimeSpan(0, 18, 0, 0, 0), new TimeSpan(0, 17, 0, 0, 0), "Yoga Avanzado" },
                    { 4, 4, 12, 4, 5, new TimeSpan(0, 19, 0, 0, 0), new TimeSpan(0, 18, 0, 0, 0), "Spinning Cardio" },
                    { 5, 2, 18, 5, 4, new TimeSpan(0, 20, 0, 0, 0), new TimeSpan(0, 19, 0, 0, 0), "Funcional Full" },
                    { 6, 3, 8, 6, 3, new TimeSpan(0, 11, 0, 0, 0), new TimeSpan(0, 10, 0, 0, 0), "Yoga Relax" }
                });

            migrationBuilder.InsertData(
                table: "Miembro",
                columns: new[] { "Id", "Apellido", "DescuentoId", "Direccion", "Dni", "EntrenadorId", "FechaNacimiento", "Nombre", "Telefono", "UrlFoto" },
                values: new object[,]
                {
                    { 1, "Gómez", 1, "Calle 101", 41000001, null, new DateTime(1991, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Juan", 110000001, "https://randomuser.me/api/portraits/men/0.jpg" },
                    { 2, "Ramírez", 2, "Calle 102", 41000002, null, new DateTime(1992, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lucía", 110000002, "https://randomuser.me/api/portraits/men/1.jpg" },
                    { 3, "Fernández", 3, "Calle 103", 41000003, null, new DateTime(1992, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), "Carlos", 110000003, "https://randomuser.me/api/portraits/men/2.jpg" },
                    { 4, "López", 1, "Calle 104", 41000004, null, new DateTime(1993, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), "Mariana", 110000004, "https://randomuser.me/api/portraits/men/3.jpg" },
                    { 5, "Pérez", 2, "Calle 105", 41000005, null, new DateTime(1994, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), "Diego", 110000005, "https://randomuser.me/api/portraits/men/4.jpg" },
                    { 6, "Martínez", 3, "Calle 106", 41000006, null, new DateTime(1995, 12, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sofía", 110000006, "https://randomuser.me/api/portraits/men/5.jpg" },
                    { 7, "García", 1, "Calle 107", 41000007, null, new DateTime(1996, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Martín", 110000007, "https://randomuser.me/api/portraits/men/6.jpg" },
                    { 8, "Sosa", 2, "Calle 108", 41000008, null, new DateTime(1997, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Camila", 110000008, "https://randomuser.me/api/portraits/men/7.jpg" },
                    { 9, "Vargas", 3, "Calle 109", 41000009, null, new DateTime(1998, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Federico", 110000009, "https://randomuser.me/api/portraits/men/8.jpg" },
                    { 10, "Silva", 1, "Calle 110", 41000010, null, new DateTime(1999, 12, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), "Valentina", 110000010, "https://randomuser.me/api/portraits/men/9.jpg" },
                    { 11, "Rodríguez", 2, "Calle 111", 41000011, null, new DateTime(2000, 12, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "Gonzalo", 110000011, "https://randomuser.me/api/portraits/men/10.jpg" },
                    { 12, "Torres", 3, "Calle 112", 41000012, null, new DateTime(2001, 12, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "Carolina", 110000012, "https://randomuser.me/api/portraits/men/11.jpg" },
                    { 13, "Alvarez", 1, "Calle 113", 41000013, null, new DateTime(2002, 12, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "Andrés", 110000013, "https://randomuser.me/api/portraits/men/12.jpg" },
                    { 14, "Molina", 2, "Calle 114", 41000014, null, new DateTime(2003, 12, 29, 0, 0, 0, 0, DateTimeKind.Unspecified), "Florencia", 110000014, "https://randomuser.me/api/portraits/men/13.jpg" },
                    { 15, "Herrera", 3, "Calle 115", 41000015, null, new DateTime(2004, 12, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Pablo", 110000015, "https://randomuser.me/api/portraits/men/14.jpg" },
                    { 16, "Rossi", 1, "Calle 116", 41000016, null, new DateTime(2005, 12, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Agustina", 110000016, "https://randomuser.me/api/portraits/men/15.jpg" },
                    { 17, "Domínguez", 2, "Calle 117", 41000017, null, new DateTime(2006, 12, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sebastián", 110000017, "https://randomuser.me/api/portraits/men/16.jpg" },
                    { 18, "Ruiz", 3, "Calle 118", 41000018, null, new DateTime(2007, 12, 28, 0, 0, 0, 0, DateTimeKind.Unspecified), "Ana", 110000018, "https://randomuser.me/api/portraits/men/17.jpg" },
                    { 19, "Ortiz", 1, "Calle 119", 41000019, null, new DateTime(2008, 12, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), "Tomás", 110000019, "https://randomuser.me/api/portraits/men/18.jpg" },
                    { 20, "Iglesias", 2, "Calle 120", 41000020, null, new DateTime(2009, 12, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), "Laura", 110000020, "https://randomuser.me/api/portraits/men/19.jpg" },
                    { 21, "Castro", 3, "Calle 121", 41000021, null, new DateTime(2010, 12, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), "Ricardo", 110000021, "https://randomuser.me/api/portraits/men/20.jpg" },
                    { 22, "Díaz", 1, "Calle 122", 41000022, null, new DateTime(2011, 12, 27, 0, 0, 0, 0, DateTimeKind.Unspecified), "Gabriela", 110000022, "https://randomuser.me/api/portraits/men/21.jpg" },
                    { 23, "Páez", 2, "Calle 123", 41000023, null, new DateTime(2012, 12, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "Nicolás", 110000023, "https://randomuser.me/api/portraits/men/22.jpg" },
                    { 24, "Suárez", 3, "Calle 124", 41000024, null, new DateTime(2013, 12, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "Sabrina", 110000024, "https://randomuser.me/api/portraits/men/23.jpg" },
                    { 25, "Méndez", 1, "Calle 125", 41000025, null, new DateTime(2014, 12, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), "Bruno", 110000025, "https://randomuser.me/api/portraits/men/24.jpg" }
                });

            migrationBuilder.InsertData(
                table: "Asistencia",
                columns: new[] { "Id", "ClaseId", "Fecha", "Metodo", "MiembroId" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2025, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 1 },
                    { 2, 2, new DateTime(2025, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 2 },
                    { 3, 3, new DateTime(2025, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 3 },
                    { 4, 4, new DateTime(2025, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 4 },
                    { 5, 5, new DateTime(2025, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 5 },
                    { 6, 6, new DateTime(2025, 2, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 6 },
                    { 7, 1, new DateTime(2025, 2, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 7 },
                    { 8, 2, new DateTime(2025, 2, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 8 },
                    { 9, 3, new DateTime(2025, 2, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 9 },
                    { 10, 4, new DateTime(2025, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 10 },
                    { 11, 5, new DateTime(2025, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 11 },
                    { 12, 6, new DateTime(2025, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 12 },
                    { 13, 1, new DateTime(2025, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 13 },
                    { 14, 2, new DateTime(2025, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 14 },
                    { 15, 3, new DateTime(2025, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 15 },
                    { 16, 4, new DateTime(2025, 2, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 16 },
                    { 17, 5, new DateTime(2025, 2, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 17 },
                    { 18, 6, new DateTime(2025, 2, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 18 },
                    { 19, 1, new DateTime(2025, 2, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 19 },
                    { 20, 2, new DateTime(2025, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 20 },
                    { 21, 3, new DateTime(2025, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 21 },
                    { 22, 4, new DateTime(2025, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 22 },
                    { 23, 5, new DateTime(2025, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 23 },
                    { 24, 6, new DateTime(2025, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 0, 24 },
                    { 25, 1, new DateTime(2025, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 25 }
                });

            migrationBuilder.InsertData(
                table: "Inscripcion",
                columns: new[] { "Id", "ClaseId", "FechaInscripcion", "MiembroId" },
                values: new object[,]
                {
                    { 1, 1, new DateTime(2025, 2, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 1 },
                    { 2, 2, new DateTime(2025, 2, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2 },
                    { 3, 3, new DateTime(2025, 2, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 3 },
                    { 4, 4, new DateTime(2025, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 4 },
                    { 5, 5, new DateTime(2025, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 5 },
                    { 6, 6, new DateTime(2025, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 6 },
                    { 7, 1, new DateTime(2025, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 7 },
                    { 8, 2, new DateTime(2025, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 8 },
                    { 9, 3, new DateTime(2025, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 9 },
                    { 10, 4, new DateTime(2025, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 10 },
                    { 11, 5, new DateTime(2025, 2, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 11 },
                    { 12, 6, new DateTime(2025, 2, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 12 },
                    { 13, 1, new DateTime(2025, 2, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 13 },
                    { 14, 2, new DateTime(2025, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 14 },
                    { 15, 3, new DateTime(2025, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 15 },
                    { 16, 4, new DateTime(2025, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 16 },
                    { 17, 5, new DateTime(2025, 2, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 17 },
                    { 18, 6, new DateTime(2025, 2, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 18 },
                    { 19, 1, new DateTime(2025, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 19 },
                    { 20, 2, new DateTime(2025, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 20 },
                    { 21, 3, new DateTime(2025, 2, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 21 },
                    { 22, 4, new DateTime(2025, 2, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 22 },
                    { 23, 5, new DateTime(2025, 2, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 23 },
                    { 24, 6, new DateTime(2025, 2, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 24 },
                    { 25, 1, new DateTime(2025, 2, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 25 }
                });

            migrationBuilder.InsertData(
                table: "Membresia",
                columns: new[] { "Id", "CostoFinal", "FechaInicio", "FechaVencimiento", "MiembroId", "TipoMembresiaId" },
                values: new object[,]
                {
                    { 1, 15000m, new DateTime(2025, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 1 },
                    { 2, 40000m, new DateTime(2025, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 2 },
                    { 3, 140000m, new DateTime(2025, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 3 },
                    { 4, 15000m, new DateTime(2025, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 4, 1 },
                    { 5, 40000m, new DateTime(2025, 1, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, 2 },
                    { 6, 140000m, new DateTime(2025, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 6, 3 },
                    { 7, 15000m, new DateTime(2025, 1, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 7, 1 },
                    { 8, 40000m, new DateTime(2025, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 8, 2 },
                    { 9, 140000m, new DateTime(2025, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 9, 3 },
                    { 10, 15000m, new DateTime(2025, 1, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 10, 1 },
                    { 11, 40000m, new DateTime(2025, 1, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 11, 2 },
                    { 12, 140000m, new DateTime(2025, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 12, 3 },
                    { 13, 15000m, new DateTime(2025, 1, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 13, 1 },
                    { 14, 40000m, new DateTime(2025, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 14, 2 },
                    { 15, 140000m, new DateTime(2025, 1, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 15, 3 },
                    { 16, 15000m, new DateTime(2025, 1, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 16, 1 },
                    { 17, 40000m, new DateTime(2025, 1, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 17, 2 },
                    { 18, 140000m, new DateTime(2025, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 18, 3 },
                    { 19, 15000m, new DateTime(2025, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 19, 1 },
                    { 20, 40000m, new DateTime(2025, 1, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 20, 2 },
                    { 21, 140000m, new DateTime(2025, 1, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 21, 3 },
                    { 22, 15000m, new DateTime(2025, 1, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 22, 1 },
                    { 23, 40000m, new DateTime(2025, 1, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 23, 2 },
                    { 24, 140000m, new DateTime(2025, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2026, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 24, 3 },
                    { 25, 15000m, new DateTime(2025, 1, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 2, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 25, 1 }
                });

            migrationBuilder.InsertData(
                table: "Pago",
                columns: new[] { "Id", "Fecha", "MembresiaId", "MetodoPago", "Monto" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 1, 15000m },
                    { 2, new DateTime(2025, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 2, 40000m },
                    { 3, new DateTime(2025, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 3, 3, 140000m },
                    { 4, new DateTime(2025, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 4, 0, 15000m },
                    { 5, new DateTime(2025, 1, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 5, 1, 40000m },
                    { 6, new DateTime(2025, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 6, 2, 140000m },
                    { 7, new DateTime(2025, 1, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 7, 3, 15000m },
                    { 8, new DateTime(2025, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 8, 0, 40000m },
                    { 9, new DateTime(2025, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 9, 1, 140000m },
                    { 10, new DateTime(2025, 1, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 10, 2, 15000m },
                    { 11, new DateTime(2025, 1, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 11, 3, 40000m },
                    { 12, new DateTime(2025, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 12, 0, 140000m },
                    { 13, new DateTime(2025, 1, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 13, 1, 15000m },
                    { 14, new DateTime(2025, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 14, 2, 40000m },
                    { 15, new DateTime(2025, 1, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 15, 3, 140000m },
                    { 16, new DateTime(2025, 1, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 16, 0, 15000m },
                    { 17, new DateTime(2025, 1, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 17, 1, 40000m },
                    { 18, new DateTime(2025, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 18, 2, 140000m },
                    { 19, new DateTime(2025, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 19, 3, 15000m },
                    { 20, new DateTime(2025, 1, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 20, 0, 40000m },
                    { 21, new DateTime(2025, 1, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 21, 1, 140000m },
                    { 22, new DateTime(2025, 1, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 22, 2, 15000m },
                    { 23, new DateTime(2025, 1, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 23, 3, 40000m },
                    { 24, new DateTime(2025, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 24, 0, 140000m },
                    { 25, new DateTime(2025, 1, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 25, 1, 15000m }
                });

            migrationBuilder.InsertData(
                table: "Ticket",
                columns: new[] { "Id", "Detalle", "FechaEmision", "PagoId" },
                values: new object[,]
                {
                    { 1, "Pago registrado el 2025-01-02 por Juan Gómez. Monto: $15,000. Método: QR.", new DateTime(2025, 1, 2, 0, 0, 0, 0, DateTimeKind.Unspecified), 1 },
                    { 2, "Pago registrado el 2025-01-03 por Lucía Ramírez. Monto: $40,000. Método: TarjetaDebito.", new DateTime(2025, 1, 3, 0, 0, 0, 0, DateTimeKind.Unspecified), 2 },
                    { 3, "Pago registrado el 2025-01-04 por Carlos Fernández. Monto: $140,000. Método: TarjetaCredito.", new DateTime(2025, 1, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), 3 },
                    { 4, "Pago registrado el 2025-01-05 por Mariana López. Monto: $15,000. Método: Efectivo.", new DateTime(2025, 1, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), 4 },
                    { 5, "Pago registrado el 2025-01-06 por Diego Pérez. Monto: $40,000. Método: QR.", new DateTime(2025, 1, 6, 0, 0, 0, 0, DateTimeKind.Unspecified), 5 },
                    { 6, "Pago registrado el 2025-01-07 por Sofía Martínez. Monto: $140,000. Método: TarjetaDebito.", new DateTime(2025, 1, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), 6 },
                    { 7, "Pago registrado el 2025-01-08 por Martín García. Monto: $15,000. Método: TarjetaCredito.", new DateTime(2025, 1, 8, 0, 0, 0, 0, DateTimeKind.Unspecified), 7 },
                    { 8, "Pago registrado el 2025-01-09 por Camila Sosa. Monto: $40,000. Método: Efectivo.", new DateTime(2025, 1, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), 8 },
                    { 9, "Pago registrado el 2025-01-10 por Federico Vargas. Monto: $140,000. Método: QR.", new DateTime(2025, 1, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 9 },
                    { 10, "Pago registrado el 2025-01-11 por Valentina Silva. Monto: $15,000. Método: TarjetaDebito.", new DateTime(2025, 1, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), 10 },
                    { 11, "Pago registrado el 2025-01-12 por Gonzalo Rodríguez. Monto: $40,000. Método: TarjetaCredito.", new DateTime(2025, 1, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), 11 },
                    { 12, "Pago registrado el 2025-01-13 por Carolina Torres. Monto: $140,000. Método: Efectivo.", new DateTime(2025, 1, 13, 0, 0, 0, 0, DateTimeKind.Unspecified), 12 },
                    { 13, "Pago registrado el 2025-01-14 por Andrés Alvarez. Monto: $15,000. Método: QR.", new DateTime(2025, 1, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), 13 },
                    { 14, "Pago registrado el 2025-01-15 por Florencia Molina. Monto: $40,000. Método: TarjetaDebito.", new DateTime(2025, 1, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), 14 },
                    { 15, "Pago registrado el 2025-01-16 por Pablo Herrera. Monto: $140,000. Método: TarjetaCredito.", new DateTime(2025, 1, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), 15 },
                    { 16, "Pago registrado el 2025-01-17 por Agustina Rossi. Monto: $15,000. Método: Efectivo.", new DateTime(2025, 1, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), 16 },
                    { 17, "Pago registrado el 2025-01-18 por Sebastián Domínguez. Monto: $40,000. Método: QR.", new DateTime(2025, 1, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 17 },
                    { 18, "Pago registrado el 2025-01-19 por Ana Ruiz. Monto: $140,000. Método: TarjetaDebito.", new DateTime(2025, 1, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), 18 },
                    { 19, "Pago registrado el 2025-01-20 por Tomás Ortiz. Monto: $15,000. Método: TarjetaCredito.", new DateTime(2025, 1, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 19 },
                    { 20, "Pago registrado el 2025-01-21 por Laura Iglesias. Monto: $40,000. Método: Efectivo.", new DateTime(2025, 1, 21, 0, 0, 0, 0, DateTimeKind.Unspecified), 20 },
                    { 21, "Pago registrado el 2025-01-22 por Ricardo Castro. Monto: $140,000. Método: QR.", new DateTime(2025, 1, 22, 0, 0, 0, 0, DateTimeKind.Unspecified), 21 },
                    { 22, "Pago registrado el 2025-01-23 por Gabriela Díaz. Monto: $15,000. Método: TarjetaDebito.", new DateTime(2025, 1, 23, 0, 0, 0, 0, DateTimeKind.Unspecified), 22 },
                    { 23, "Pago registrado el 2025-01-24 por Nicolás Páez. Monto: $40,000. Método: TarjetaCredito.", new DateTime(2025, 1, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), 23 },
                    { 24, "Pago registrado el 2025-01-25 por Sabrina Suárez. Monto: $140,000. Método: Efectivo.", new DateTime(2025, 1, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), 24 },
                    { 25, "Pago registrado el 2025-01-26 por Bruno Méndez. Monto: $15,000. Método: QR.", new DateTime(2025, 1, 26, 0, 0, 0, 0, DateTimeKind.Unspecified), 25 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_ClaseId",
                table: "Asistencia",
                column: "ClaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Asistencia_MiembroId",
                table: "Asistencia",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_Clase_ActividadId",
                table: "Clase",
                column: "ActividadId");

            migrationBuilder.CreateIndex(
                name: "IX_Clase_EntrenadorId",
                table: "Clase",
                column: "EntrenadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Inscripcion_ClaseId",
                table: "Inscripcion",
                column: "ClaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Inscripcion_MiembroId",
                table: "Inscripcion",
                column: "MiembroId");

            migrationBuilder.CreateIndex(
                name: "IX_Membresia_MiembroId",
                table: "Membresia",
                column: "MiembroId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Membresia_TipoMembresiaId",
                table: "Membresia",
                column: "TipoMembresiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Miembro_DescuentoId",
                table: "Miembro",
                column: "DescuentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Miembro_EntrenadorId",
                table: "Miembro",
                column: "EntrenadorId");

            migrationBuilder.CreateIndex(
                name: "IX_Pago_MembresiaId",
                table: "Pago",
                column: "MembresiaId");

            migrationBuilder.CreateIndex(
                name: "IX_Ticket_PagoId",
                table: "Ticket",
                column: "PagoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Asistencia");

            migrationBuilder.DropTable(
                name: "Empleado");

            migrationBuilder.DropTable(
                name: "Inscripcion");

            migrationBuilder.DropTable(
                name: "Ticket");

            migrationBuilder.DropTable(
                name: "Clase");

            migrationBuilder.DropTable(
                name: "Pago");

            migrationBuilder.DropTable(
                name: "Actividad");

            migrationBuilder.DropTable(
                name: "Membresia");

            migrationBuilder.DropTable(
                name: "Miembro");

            migrationBuilder.DropTable(
                name: "TipoMembresia");

            migrationBuilder.DropTable(
                name: "Descuento");

            migrationBuilder.DropTable(
                name: "Entrenador");
        }
    }
}
