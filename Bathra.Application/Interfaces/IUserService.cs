using Bathra.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bathra.Application.Interfaces
{
    public interface IUserService
    {
        Task<bool> RegisterUserAsync(UserRegisterDto userRegisterDto);
        Task<UserLoginDto> LoginUserAsync(UserLoginDto userDto);
    }
}
