using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class TeamRoundProgressDto
    {
        public Guid RoundId { get; set; }
        public string RoundName { get; set; } = string.Empty;
        public int RoundOrder { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EffectiveEndAtUtc { get; set; }
        public bool IsFinalized { get; set; }
        public DateTime? FinalizedAt { get; set; }
        public int? RankPosition { get; set; }
        public decimal? TotalScore { get; set; }
        public bool? IsAdvanced { get; set; }
        public bool IsFinalRound { get; set; }
        public bool? IsAwarded { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsEligible { get; set; }
        public bool CanSubmit { get; set; }
        public string? BlockedReason { get; set; }
    }
}
