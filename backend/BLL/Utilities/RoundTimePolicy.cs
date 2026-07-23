using System;

namespace BusinessLogicLayer.Utilities
{
    public static class RoundTimePolicy
    {
        private static readonly TimeZoneInfo VietnamTimeZone = ResolveVietnamTimeZone();

        public static DateTime GetEffectiveEndAtUtc(DateTime endDate)
        {
            var endDateInVietnam = DateTime.SpecifyKind(endDate.Date, DateTimeKind.Unspecified);
            var nextDayMidnight = endDateInVietnam.AddDays(1);
            return TimeZoneInfo.ConvertTimeToUtc(nextDayMidnight, VietnamTimeZone);
        }

        public static bool HasEnded(DateTime endDate, DateTime utcNow)
        {
            return NormalizeUtc(utcNow) >= GetEffectiveEndAtUtc(endDate);
        }

        public static DateTime NormalizeUtc(DateTime value)
        {
            return value.Kind == DateTimeKind.Utc
                ? value
                : DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private static TimeZoneInfo ResolveVietnamTimeZone()
        {
            foreach (var id in new[] { "SE Asia Standard Time", "Asia/Ho_Chi_Minh", "Asia/Saigon" })
            {
                try
                {
                    return TimeZoneInfo.FindSystemTimeZoneById(id);
                }
                catch (TimeZoneNotFoundException)
                {
                }
                catch (InvalidTimeZoneException)
                {
                }
            }

            return TimeZoneInfo.CreateCustomTimeZone(
                "Asia/Saigon-Fallback",
                TimeSpan.FromHours(7),
                "Asia/Saigon",
                "Asia/Saigon");
        }
    }
}
