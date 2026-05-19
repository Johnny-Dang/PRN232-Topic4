using DataAccessLayer.Database;
using DataAccessLayer.Database.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementations
{
    public class RoundRepository : GenericRepository<Rounds>, IRoundRepository
    {
        public RoundRepository(IApplicationDbContext context) : base(context)
        {
        }
    }
}
