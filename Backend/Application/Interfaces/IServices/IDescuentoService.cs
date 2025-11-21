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
    public interface IDescuentoService
    {
        Task<DescuentoResponse> Add(DescuentoRequest request);
        Task<List<DescuentoResponse>> GetAll();
        Task<DescuentoResponse> GetById(int id);
        Task<DescuentoResponse> Update(int id, DescuentoRequest request);
        Task Delete(int id);
    }
}
