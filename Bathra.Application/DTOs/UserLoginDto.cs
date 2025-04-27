using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace Bathra.Application.DTOs
{
    public class UserLoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string AccountType { get; set; }
        public HttpStatusCode ResponseCode { get; set; }
        public string ResponseMessage { get; set; }
    }
}
