using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class AddAdvancementRuleRequest
    {
        public Guid RoundId { get; set; }
        public Guid CategoryId { get; set; }
        public int TopN { get; set; }
    }
}
