using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Application.Interfaces.ICommands;
using Domain.Entities;
using BCrypt.Net;

namespace Infrastructure.Commands
{
    public class LoginCommand : ILoginCommand
    {
        public Empleado Execute(string passwordIngresada, Empleado empleado)
        {
            bool passwordOk = BCrypt.Net.BCrypt.Verify(
                passwordIngresada,
                empleado.PasswordHash
            );

            if (!passwordOk)
                throw new UnauthorizedAccessException("Contraseña incorrecta");

            return empleado;
        }
    }
}
