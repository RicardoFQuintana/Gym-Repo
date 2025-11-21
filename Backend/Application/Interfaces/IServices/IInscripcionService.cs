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
    public interface IInscripcionService
    {
        Task Add(InscripcionAddRequest request);
        Task<InscripcionResponse> GetById(int id);
        Task<List<InscripcionResponse>> GetByMiembro(int miembroId);
        Task<List<InscripcionResponse>> GetByClase(int claseId);
        Task Delete(int id);
    }
}
