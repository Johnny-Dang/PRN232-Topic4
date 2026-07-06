'use client';

import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Category, Ranking, Round, Team, getCategories, getRankings, getRounds, getTeams } from '@/lib/api';

export default function RankingBoard() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [rounds, setRounds] = useState<Round[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [fetchedRounds, fetchedCategories, fetchedTeams] = await Promise.all([
          getRounds(),
          getCategories(),
          getTeams(),
        ]);
        setRounds(fetchedRounds);
        setCategories(fetchedCategories);
        setTeams(fetchedTeams);

        if (fetchedRounds.length > 0) {
          setSelectedRoundId(fetchedRounds[0].RoundID);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setMessage('Khong the tai du lieu.');
      } finally {
        setLoading(false);
      }
    };
    void loadInitialData();
  }, []);

  useEffect(() => {
    const loadRankings = async () => {
      if (!selectedRoundId) {
        setRankings([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getRankings(selectedRoundId);
        setRankings(data);
      } catch (error) {
        console.error('Failed to load rankings:', error);
        setMessage('Khong the tai bang xep hang.');
      } finally {
        setLoading(false);
      }
    };
    void loadRankings();
  }, [selectedRoundId]);

  const getTeamForRanking = (teamId: string): Team | undefined => {
    return teams.find((t) => t.TeamID === teamId);
  };

  const selectedRound = rounds.find((r) => r.RoundID === selectedRoundId);

  if (loading && rounds.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-96 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <BarChart3 className="h-5 w-5 text-indigo-500" />
                Bang xep hang - {selectedRound?.RoundName || 'Chon vong thi'}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Xem ket qua cham diem va xep hang cac doi tuyen
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (selectedRoundId) {
                  setLoading(true);
                  try {
                    const data = await getRankings(selectedRoundId);
                    setRankings(data);
                  } catch (error) {
                    console.error('Failed to refresh:', error);
                  } finally {
                    setLoading(false);
                  }
                }
              }}
              disabled={loading || !selectedRoundId}
              className="h-9 w-fit rounded-xl border-slate-200 text-xs font-semibold"
            >
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Tai lai
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Vong thi</Label>
              <select
                value={selectedRoundId}
                onChange={(e) => {
                  setSelectedRoundId(e.target.value);
                  setSelectedCategoryId('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">-- Chon vong --</option>
                {rounds.map((round) => (
                  <option key={round.RoundID} value={round.RoundID}>
                    {round.RoundName}
                  </option>
                ))}
              </select>
            </div>

            {categories.length > 0 && (
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hang muc</Label>
                  <button
                    onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                    className="text-[10px] font-medium text-indigo-500 hover:text-indigo-600"
                  >
                    {showCategoryFilter ? 'An loc' : 'Hien loc'}
                  </button>
                </div>
                {showCategoryFilter ? (
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="">Tat ca hang muc</option>
                    {categories.map((cat) => (
                      <option key={cat.CategoryID} value={cat.CategoryID}>
                        {cat.CategoryName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    Tat ca hang muc
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {message}
        </div>
      )}

      {rankings.length === 0 && selectedRoundId ? (
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-500">Chua co du lieu xep hang</p>
            <p className="mt-1 text-xs text-slate-400">
              Vong thi nay chua co ket qua cham diem nao.
            </p>
          </CardContent>
        </Card>
      ) : rankings.length > 0 ? (
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold">Ket qua xep hang</CardTitle>
              <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {rankings.length} doi tuyen
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hang</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Doi tuyen</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hang muc</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Diem tong</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((ranking, index) => {
                    const team = getTeamForRanking(ranking.TeamId);
                    const teamCategory = team?.CategoryID ? categories.find((c) => c.CategoryID === team.CategoryID) : null;
                    const isFiltered = selectedCategoryId && team?.CategoryID !== selectedCategoryId;

                    if (isFiltered) return null;

                    return (
                      <tr
                        key={ranking.RankingId}
                        className={`border-b border-slate-50 dark:border-slate-800/50 ${
                          index < 3 ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          {index === 0 ? (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-sm font-black text-white shadow-lg">
                              1
                            </span>
                          ) : index === 1 ? (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-sm font-black text-white shadow">
                              2
                            </span>
                          ) : index === 2 ? (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-700 text-sm font-black text-white shadow">
                              3
                            </span>
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800">
                              {ranking.RankPosition || index + 1}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {team?.TeamName || ranking.TeamId}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          {teamCategory ? (
                            <Badge className="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                              {teamCategory.CategoryName}
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className={`text-lg font-black ${
                            index === 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : index === 1
                              ? 'text-slate-600 dark:text-slate-400'
                              : index === 2
                              ? 'text-amber-700 dark:text-amber-500'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {ranking.TotalScore.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
