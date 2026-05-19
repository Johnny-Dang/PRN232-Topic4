using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateAdvancementRuleRequest
    {
        public Guid RuleId { get; set; }
        public Guid RoundId { get; set; }
        public Guid CategoryId { get; set; }
        public int TopN { get; set; }
    }
}
