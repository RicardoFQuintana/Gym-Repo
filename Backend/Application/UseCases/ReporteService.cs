using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Interfaces.IQuerys;
using Application.Interfaces.IServices;

namespace Application.UseCases
{
    public class ReporteService : IReporteService
    {
        private readonly IReporteQuery _query;

        public ReporteService(IReporteQuery query)
        {
            _query = query;
        }

        public async Task<ReporteIngresosResponse> ReporteIngresosData(ReporteFilterRequest filter)
        {
            return await _query.ObtenerReporteIngresos(filter);
        }

        public async Task<ReporteAsistenciaResponse> ReporteAsistenciaData(ReporteFilterRequest filter)
        {
            return await _query.ObtenerReporteAsistencia(filter);
        }

        public async Task<ReporteFinancieroResponse> ReporteFinancieroData(ReporteFilterRequest filter)
        {
            return await _query.ObtenerReporteFinanciero(filter);
        }
    }
}