using Application.DTOs.Requests;
using Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IServices
{
    public interface IActividadService
    {
        Task<ActividadResponse> Add(ActividadRequest request);
        Task<List<ActividadResponse>> GetAll();
        Task<ActividadResponse> GetById(int id);
        Task<ActividadResponse> Update(int id, ActividadRequest request);
        Task Delete(int id);
    }
}
