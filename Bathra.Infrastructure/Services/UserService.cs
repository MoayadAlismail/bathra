using Bathra.Domain.Entities;
using Bathra.Infrastructure.Context;
using Microsoft.AspNetCore.Identity;
using Bathra.Application.Interfaces;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bathra.Application.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Bathra.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;
        public UserService(AppDbContext context) {
            _context = context;
            _passwordHasher = new PasswordHasher<User>();

        }
        public async Task<bool> RegisterUserAsync(UserRegisterDto userDto)
        {
            var user = new User
            {
                UserName = userDto.UserName,
                Email = userDto.Email,
                Fk_AccountTypeID = userDto.AccountType,
                Fk_InvestmentFocusID = userDto.InvestmentId,
                Fk_InvestmentRangeID = userDto.InvestmentRange
            };
            user.Password = _passwordHasher.HashPassword(user,userDto.Password);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<UserLoginDto> LoginUserAsync(UserLoginDto userDto)
        {
            UserLoginDto userLogin = new UserLoginDto();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userDto.Email);
            if (user == null)
            {
                userLogin.ResponseCode = System.Net.HttpStatusCode.BadRequest;
                userLogin.ResponseMessage = "User not found";
                return userLogin;
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.Password, userDto.Password);
            if (result == PasswordVerificationResult.Success)
            {
                var accountType = _context.Set_AccountTypes.FirstOrDefault(x => x.AccountTypeID == user.Fk_AccountTypeID);
                if (accountType != null)
                {
                    userLogin.Email = user.Email;
                    userLogin.AccountType = accountType.TypeName;
                    userLogin.ResponseCode = System.Net.HttpStatusCode.OK;
                    userLogin.ResponseMessage = "Success";
                }
            }

            return userLogin;
        }
    }
}
