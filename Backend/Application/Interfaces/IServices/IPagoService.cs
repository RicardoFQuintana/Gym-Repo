using Application.DTOs.Requests;
using Application.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.IServices
{
    public interface IPagoService
    {
        Task<PagoResponse> Add(PagoRequest request);
        Task<IEnumerable<PagoResponse>> GetAll();
    }
}