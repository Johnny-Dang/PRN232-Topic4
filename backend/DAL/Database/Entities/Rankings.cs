using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Database.Entities
{
    public class Rankings
    {
        public Guid RankingId { get; set; }
        public Guid TeamId { get; set; }
        public Guid RoundId { get; set; }
        public int RankPosition { get; set; }
        public decimal TotalScore { get; set; }

        public virtual Teams Team { get; set; } = null!;
        public virtual Rounds Round { get; set; } = null!;
    }
}
