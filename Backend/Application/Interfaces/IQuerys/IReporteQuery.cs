using Application.DTOs.Requests;
using Application.DTOs.Responses;

namespace Application.Interfaces.IQuerys
{
    public interface IReporteQuery
    {
        Task<ReporteIngresosResponse> ObtenerReporteIngresos(ReporteFilterRequest filter);

        Task<ReporteAsistenciaResponse> ObtenerReporteAsistencia(ReporteFilterRequest filter);

        Task<ReporteFinancieroResponse> ObtenerReporteFinanciero(ReporteFilterRequest filter);
    }
}