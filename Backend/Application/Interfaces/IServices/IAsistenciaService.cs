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
    public interface IAsistenciaService
    {
        Task Add(AsistenciaAddRequest request);
        Task<AsistenciaResponse> GetById(int id);
        Task<List<AsistenciaResponse>> GetByMiembro(int miembroId);
        Task<List<AsistenciaResponse>> GetByClase(int claseId);
        Task<List<AsistenciaResponse>> GetByClaseYFecha(int claseId, DateTime fecha);
        Task Update(int id, AsistenciaUpdateRequest request);
        Task Delete(int id);
    }
}
