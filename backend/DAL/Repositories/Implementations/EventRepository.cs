using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementations
{
    public class EventRepository : GenericRepository<Events>, IEventRepository
    {
        public EventRepository(IApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Events?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(e => e.Rounds)
                .FirstOrDefaultAsync(e => e.EventId == id, cancellationToken);
        }

        public override async Task<IReadOnlyList<Events>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _dbSet
                .Include(e => e.Rounds)
                .ToListAsync(cancellationToken);
        }
    }
}
