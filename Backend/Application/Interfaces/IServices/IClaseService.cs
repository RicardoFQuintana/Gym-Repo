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
    public interface IClaseService
    {
        Task Add(ClaseAddRequest request);
        Task<List<ClaseResponse>> GetAll();
        Task<ClaseResponse> GetById(int id);
        Task Update(int id, ClaseUpdateRequest request);
        Task Delete(int id);
    }
}
