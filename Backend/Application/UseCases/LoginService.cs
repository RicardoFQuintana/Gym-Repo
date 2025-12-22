using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.ICommands;
using Application.Interfaces.IQuerys;
using Application.Interfaces.IServices;
using Domain.Entities;

namespace Application.UseCases
{
    public class LoginService : ILoginService
    {
        private readonly IUsuarioQuery _query;
        private readonly ILoginCommand _command;

        public LoginService(
            IUsuarioQuery query,
            ILoginCommand command)
        {
            _query = query;
            _command = command;
        }

        public Empleado Login(string usuario, string password)
        {
            var empleado = _query.Execute(usuario);

            if (empleado == null)
                throw new UnauthorizedAccessException("Usuario incorrecto");

            return _command.Execute(password, empleado);
        }
    }
}
