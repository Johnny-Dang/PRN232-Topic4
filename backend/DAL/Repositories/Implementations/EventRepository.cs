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
    }
}
