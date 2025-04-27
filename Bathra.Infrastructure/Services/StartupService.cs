using Bathra.Application.Interfaces;
using Bathra.Domain.Entities;
using Bathra.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bathra.Infrastructure.Services
{
    public class StartupService : IStartupService
    {
        private readonly AppDbContext _context;

        public StartupService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Startup>> GetAllStartupsAsync()
        {
            return await _context.Startups.ToListAsync();
        }
    }
}
