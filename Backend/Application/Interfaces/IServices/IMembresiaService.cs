using Application.DTOs.Responses;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.IServices
{
    public interface IMembresiaService
    {
        Task<List<MembresiaResponse>> GetAll();
        Task<MembresiaResponse> GetById(int id);
        Task Delete(int id);
    }
}
