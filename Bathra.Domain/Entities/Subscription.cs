using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bathra.Domain.Entities
{
    public class Subscription
    {
        [Key]
        public int InvestorId { get; set; }// Auto-incremented PK by default for int

        [Column(TypeName = "varchar(255)")] // This will create nvarchar(50)
        public required string PlanType { get; set; }

        [Column(TypeName = "varchar(100)")]
        public string? Status { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
