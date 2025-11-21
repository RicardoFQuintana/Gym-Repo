using Application.DTOs.Requests;
using Application.DTOs.Responses;

namespace Application.Interfaces.IServices
{
    public interface IReporteService
    {
        Task<ReporteIngresosResponse> ReporteIngresosData(ReporteFilterRequest filter);
        Task<ReporteAsistenciaResponse> ReporteAsistenciaData(ReporteFilterRequest filter);
        Task<ReporteFinancieroResponse> ReporteFinancieroData(ReporteFilterRequest filter);
    }
}