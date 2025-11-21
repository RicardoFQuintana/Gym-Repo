using Application.DTOs.Responses;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.IQuerys
{
    public interface IPagoQuery
    {
        Task<IEnumerable<PagoResponse>> GetAllAsync();
    }
}
