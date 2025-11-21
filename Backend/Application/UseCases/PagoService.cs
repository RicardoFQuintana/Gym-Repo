using Application.Interfaces.IServices;
using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Exceptions;
using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;

namespace Application.UseCases
{
    public class PagoService : IPagoService
    {
        private readonly IPagoQuery _query;
        private readonly IPagoCommand _command;

        public PagoService(IPagoQuery query, IPagoCommand command)
        {
            _query = query;
            _command = command;
        }

        public async Task<PagoResponse> Add(PagoRequest request)
        {
            return await _command.AddAsync(request);
        }

        public async Task<IEnumerable<PagoResponse>> GetAll()
        {
            return await _query.GetAllAsync();
        }
    }
}