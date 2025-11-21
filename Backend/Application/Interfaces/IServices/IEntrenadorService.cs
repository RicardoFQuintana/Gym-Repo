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
    public interface IEntrenadorService
    {
        Task Add(EntrenadorAddRequest request);
        Task<List<EntrenadorResponse>> GetAll();
        Task<EntrenadorResponse> GetById(int id);
        Task Update(int id, EntrenadorUpdateRequest request);
        Task Delete(int id);
    }
}
