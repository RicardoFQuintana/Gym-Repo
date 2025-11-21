using Application.DTOs.Requests;
using Application.DTOs.Responses;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IPagoCommand
    {
        Task<PagoResponse> AddAsync(PagoRequest request);
    }
}
