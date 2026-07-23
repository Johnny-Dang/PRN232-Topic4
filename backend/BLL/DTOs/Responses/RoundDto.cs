using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class RoundDto
    {
        public Guid RoundId { get; set; }
        public Guid EventId { get; set; }
        public string RoundName { get; set; } = string.Empty;
        public int RoundOrder { get; set; }
        public DateTime SubmissionDeadline { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsFinalized { get; set; }
        public DateTime? FinalizedAt { get; set; }
        public DateTime EffectiveEndAtUtc { get; set; }
        public bool IsFinalRound { get; set; }
    }
}
