using DataAccessLayer.Database.Entities;
using System;
using System.Collections.Generic;

namespace BusinessLogicLayer.Utilities
{
    public static class RoundFinalizationPolicy
    {
        public static void ApplyAdvancement(
            IEnumerable<Rankings> rankings,
            IReadOnlyDictionary<Guid, int> topNByCategory)
        {
            foreach (var ranking in rankings)
            {
                if (!topNByCategory.TryGetValue(ranking.CategoryId, out var topN))
                    throw new Exception($"Category {ranking.CategoryId} chưa có quy tắc Top N.");

                ranking.IsAdvanced = ranking.RankPosition <= topN;
            }
        }
    }
}
