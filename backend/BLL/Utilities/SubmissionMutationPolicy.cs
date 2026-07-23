using DataAccessLayer.Database.Entities;
using System;

namespace BusinessLogicLayer.Utilities
{
    public static class SubmissionMutationPolicy
    {
        public static void EnsureAllowed(Rounds round, DateTime utcNow)
        {
            var normalizedNow = RoundTimePolicy.NormalizeUtc(utcNow);
            var startAtUtc = RoundTimePolicy.NormalizeUtc(round.StartDate);
            var submissionDeadlineUtc = RoundTimePolicy.NormalizeUtc(round.SubmissionDeadline);

            if (normalizedNow < startAtUtc)
            {
                throw new Exception(
                    $"Vòng thi chưa mở. Bài nộp sẽ được chấp nhận từ "
                    + $"{startAtUtc:yyyy-MM-dd HH:mm:ss} UTC.");
            }

            if (round.IsFinalized || RoundTimePolicy.HasEnded(round.EndDate, normalizedNow))
                throw new Exception("Vòng thi đã kết thúc và bài nộp đã được khóa.");

            if (normalizedNow > submissionDeadlineUtc)
                throw new Exception("Đã quá hạn nộp bài.");
        }
    }
}
