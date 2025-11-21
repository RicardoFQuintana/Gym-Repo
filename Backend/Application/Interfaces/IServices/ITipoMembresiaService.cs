using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IServices
{
    public interface ITipoMembresiaService
    {
        Task<TipoMembresiaResponse> Add(TipoMembresiaRequest request);
        Task<TipoMembresiaResponse> GetById(int id);
        Task<List<TipoMembresiaResponse>> GetAll();
        Task<TipoMembresiaResponse> Update(int id, TipoMembresiaRequest request);
        Task Delete(int id);
    }
}
