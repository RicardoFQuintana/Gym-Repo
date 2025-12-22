using Application.DTOs.Responses;
using Domain.Entities;
using System.Threading.Tasks;

namespace Application.Interfaces.ICommands
{
    public interface IPagoCommand
    {
        Task<Pago> AddAsync(Pago pago);
    }
}
