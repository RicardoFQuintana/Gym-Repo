using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;
using Application.Interfaces.IServices;
using Application.UseCases;
using Infrastructure.Commands;
using Infrastructure.Persistence;
using Infrastructure.Queries;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// =====================
// SERVICES
// =====================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(connectionString));

// =====================
// DEPENDENCY INJECTION
// =====================

builder.Services.AddScoped<IMiembroService, MiembroService>();
builder.Services.AddScoped<IMiembroQuery, MiembroQuery>();
builder.Services.AddScoped<IMiembroCommand, MiembroCommand>();
builder.Services.AddScoped<IMembresiaService, MembresiaService>();
builder.Services.AddScoped<IMembresiaQuery, MembresiaQuery>();
builder.Services.AddScoped<IMembresiaCommand, MembresiaCommand>();
builder.Services.AddScoped<ITipoMembresiaService, TipoMembresiaService>();
builder.Services.AddScoped<ITipoMembresiaQuery, TipoMembresiaQuery>();
builder.Services.AddScoped<ITipoMembresiaCommand, TipoMembresiaCommand>();
builder.Services.AddScoped<IDescuentoService, DescuentoService>();
builder.Services.AddScoped<IDescuentoQuery, DescuentoQuery>();
builder.Services.AddScoped<IDescuentoCommand, DescuentoCommand>();
builder.Services.AddScoped<IEntrenadorService, EntrenadorService>();
builder.Services.AddScoped<IEntrenadorQuery, EntrenadorQuery>();
builder.Services.AddScoped<IEntrenadorCommand, EntrenadorCommand>();
builder.Services.AddScoped<IClaseService, ClaseService>();
builder.Services.AddScoped<IClaseQuery, ClaseQuery>();
builder.Services.AddScoped<IClaseCommand, ClaseCommand>();
builder.Services.AddScoped<IAsistenciaService, AsistenciaService>();
builder.Services.AddScoped<IAsistenciaQuery, AsistenciaQuery>();
builder.Services.AddScoped<IAsistenciaCommand, AsistenciaCommand>();
builder.Services.AddScoped<IActividadService, ActividadService>();
builder.Services.AddScoped<IActividadQuery, ActividadQuery>();
builder.Services.AddScoped<IActividadCommand, ActividadCommand>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<IPagoQuery, PagoQuery>();
builder.Services.AddScoped<IPagoCommand, PagoCommand>();
builder.Services.AddScoped<IReporteService, ReporteService>();
builder.Services.AddScoped<IReporteQuery, ReporteQuery>();
builder.Services.AddScoped<IInscripcionService, InscripcionService>();
builder.Services.AddScoped<IInscripcionQuery, InscripcionQuery>();
builder.Services.AddScoped<IInscripcionCommand, InscripcionCommand>();
builder.Services.AddScoped<IUsuarioQuery, UsuarioQuery>();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<ILoginCommand, LoginCommand>();

// =====================
// BUILD
// =====================

var app = builder.Build();

// =====================
// GLOBAL ERROR HANDLING
// =====================

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("Error interno del servidor");
    });
});

// =====================
// PIPELINE
// =====================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
