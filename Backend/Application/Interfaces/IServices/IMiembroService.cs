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
    public interface IMiembroService
    {
        Task<MiembroResponse> Add(MiembroAddRequest request);
        Task<List<MiembroResponse>> GetAll();
        Task<MiembroResponse> GetById(int id);
        Task<MiembroResponse> GetByDNI(int DNI);
        Task<MiembroResponse> Update(int id, MiembroUpdateRequest request);
        Task Delete(int id);
        Task AsignarEntrenador(int miembroId, int entrenadorId);
    }
}
