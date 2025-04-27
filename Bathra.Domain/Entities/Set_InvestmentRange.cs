using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bathra.Domain.Entities
{

    public class Set_InvestmentRange
    {
        public int InvestmentRangeID { get; set; } //primary key

        public string RangeName { get; set; } = null!;

        public bool IsActive { get; set; }

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}
