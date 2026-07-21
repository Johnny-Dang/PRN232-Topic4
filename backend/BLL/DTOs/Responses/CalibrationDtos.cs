using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.DTOs.Responses
{
    public class CalibrationSubmissionDto
    {
        public Guid SubmissionId { get; set; }
        public Guid? TeamId { get; set; }
        public Guid RoundId { get; set; }
        public string? RoundName { get; set; }
        public Guid? EventId { get; set; }
        public string? EventName { get; set; }
        public string CalibrationTitle { get; set; } = string.Empty;
        public string? RepositoryURL { get; set; }
        public string? DemoURL { get; set; }
        public string? SlideURL { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public int JudgeCount { get; set; }
    }

    public class CalibrationScoreDto
    {
        public Guid CalibrationScoreId { get; set; }
        public Guid SubmissionId { get; set; }
        public Guid JudgeId { get; set; }
        public string? JudgeCode { get; set; }
        public Guid CriteriaId { get; set; }
        public string? CriteriaName { get; set; }
        public decimal ScoreValue { get; set; }
        public string? Comment { get; set; }
        public DateTime ScoredAt { get; set; }
    }

    public class CalibrationScoreResponseDto
    {
        public bool hasScored { get; set; }
        public List<CalibrationScoreDto> scores { get; set; } = new();
    }

    public class CalibrationAnalysisDto
    {
        public Guid SubmissionId { get; set; }
        public string CalibrationTitle { get; set; } = string.Empty;
        public int JudgeCount { get; set; }
        public int CriteriaCount { get; set; }
        public decimal OverallMean { get; set; }
        public List<CriteriaVarianceDto> CriteriaVariance { get; set; } = new();
        public List<JudgeCalibrationSummaryDto> JudgeSummaries { get; set; } = new();
        public List<string> InconsistencyFlags { get; set; } = new();
    }

    public class CriteriaVarianceDto
    {
        public Guid CriteriaId { get; set; }
        public string CriteriaName { get; set; } = string.Empty;
        public decimal MeanScore { get; set; }
        public decimal Variance { get; set; }
        public decimal StandardDeviation { get; set; }
        public decimal MinScore { get; set; }
        public decimal MaxScore { get; set; }
        public decimal ScoreRange { get; set; }
    }

    public class JudgeCalibrationSummaryDto
    {
        public Guid JudgeId { get; set; }
        public string JudgeCode { get; set; } = string.Empty;
        public decimal AverageScore { get; set; }
        public decimal DeviationFromGroupMean { get; set; }
        public string ConsistencyLabel { get; set; } = string.Empty;
    }
}
