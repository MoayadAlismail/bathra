using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bathra.Domain.Entities
{

    public class Set_InvestmentFocus
    {
        public int InvestmentFocusID { get; set; } //primary key

        public string FocusName { get; set; } = null!;

        public bool IsActive { get; set; }

        public string? FocusDetail { get; set; }

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}
