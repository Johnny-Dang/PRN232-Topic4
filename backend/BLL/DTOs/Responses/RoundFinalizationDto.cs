using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class RoundFinalizationDto
    {
        public Guid RoundId { get; set; }
        public bool IsFinalized { get; set; }
        public DateTime? FinalizedAt { get; set; }
        public IReadOnlyList<RankingDto> Rankings { get; set; } = Array.Empty<RankingDto>();
    }
}
