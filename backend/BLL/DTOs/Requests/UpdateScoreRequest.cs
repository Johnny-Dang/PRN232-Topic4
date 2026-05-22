using System;

namespace BusinessLogicLayer.DTOs.Requests
{
    public class UpdateScoreRequest
    {
        public Guid ScoreId { get; set; }
        public Guid SubmissionId { get; set; }
        public Guid AssignmentId { get; set; }
        public Guid CriteriaId { get; set; }
        public decimal ScoreValue { get; set; }
        public string Comment { get; set; } = string.Empty;
    }
}
