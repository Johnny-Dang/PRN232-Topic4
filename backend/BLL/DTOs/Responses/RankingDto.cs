using System;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class RankingDto
    {
        public Guid RankingId { get; set; }
        public Guid TeamId { get; set; }
        public string TeamName { get; set; } = string.Empty;
        public Guid RoundId { get; set; }
        public Guid CategoryId { get; set; }
        public int RankPosition { get; set; }
        public decimal TotalScore { get; set; }
        public DateTime GeneratedAt { get; set; }
        public bool? IsAdvanced { get; set; }
        public bool IsFinalRound { get; set; }
        public bool? IsAwarded { get; set; }
    }
}
