using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bathra.Domain.Entities
{

    public class User
    {
        public int UserId { get; set; }//primary key

        public string UserName { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string Password { get; set; } = null!;

        public int? Fk_AccountTypeID { get; set; }

        public int? Fk_InvestmentFocusID { get; set; }

        public int? Fk_InvestmentRangeID { get; set; }

        public bool IsActive { get; set; }

        public virtual Set_AccountType? Fk_AccountType { get; set; }

        public virtual Set_InvestmentFocus? Fk_InvestmentFocus { get; set; }

        public virtual Set_InvestmentRange? Fk_InvestmentRange { get; set; }
    }
}

