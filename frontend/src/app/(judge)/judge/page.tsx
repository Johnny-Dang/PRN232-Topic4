'use client';

import { useEffect, useState } from 'react';
import { Award, BarChart3, ClipboardList, Edit2, FileCode2, FileText, RefreshCw, Save, Send, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Category,
  Criteria,
  Ranking,
  Round,
  Score,
  Team,
  getCategories,
  getEventCriteria,
  getRounds,
  getAssignedSubmissions,
  getScores,
  getRankings,
  submitScores,
  updateScores,
  JudgeAssignedSubmission,
} from '@/lib/api';

type TabType = 'scoring' | 'ranking';

export default function JudgePage() {
  const [activeTab, setActiveTab] = useState<TabType>('scoring');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<JudgeAssignedSubmission[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [existingScores, setExistingScores] = useState<Score[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [rankings, setRankings] = useState<(Ranking & { Team: Team })[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');

  const activeSubmission = submissions.find((submission) => submission.SubmissionId === selectedSubId);
  const activeRound = activeSubmission ? rounds.find((round) => round.RoundID === activeSubmission.RoundId) : null;
  const activeCategory = activeSubmission?.CategoryId
    ? categories.find((category) => category.CategoryID === activeSubmission.CategoryId)
    : null;

  const hasExistingScores = existingScores.length > 0;

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [fetchedRounds, fetchedCategories, fetchedSubmissions] = await Promise.all([
        getRounds(),
        getCategories(),
        getAssignedSubmissions(),
      ]);

      setRounds(fetchedRounds);
      setCategories(fetchedCategories);
      setSubmissions(fetchedSubmissions);
      setSelectedSubId(fetchedSubmissions[0]?.SubmissionId || '');

      if (fetchedRounds.length > 0 && !selectedRoundId) {
        setSelectedRoundId(fetchedRounds[0].RoundID);
      }
    } catch (error) {
      console.error(error);
      setMessage('Khong the tai du lieu cham diem tu API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  useEffect(() => {
    const loadExistingScores = async () => {
      if (!activeSubmission) {
        setExistingScores([]);
        return;
      }

      setLoadingScores(true);
      try {
        const existing = await getScores(activeSubmission.SubmissionId);
        setExistingScores(existing);

        if (existing.length > 0) {
          setScores(
            Object.fromEntries(existing.map((s) => [s.CriteriaID, s.ScoreValue]))
          );
          setComments(
            Object.fromEntries(existing.map((s) => [s.CriteriaID, s.Comment || '']))
          );
        }
      } catch (error) {
        console.error('Failed to load existing scores:', error);
        setExistingScores([]);
      } finally {
        setLoadingScores(false);
      }
    };

    void loadExistingScores();
  }, [selectedSubId, activeSubmission?.SubmissionId]);

  useEffect(() => {
    const loadCriteria = async () => {
      if (!activeRound?.EventID) {
        setCriteria([]);
        return;
      }

      const fetchedCriteria = await getEventCriteria(activeRound.EventID);
      setCriteria(fetchedCriteria);

      if (existingScores.length === 0) {
        setScores(Object.fromEntries(fetchedCriteria.map((item) => [item.CriteriaID, 0])));
        setComments(Object.fromEntries(fetchedCriteria.map((item) => [item.CriteriaID, ''])));
      }
      setMessage('');
    };

    void loadCriteria();
  }, [activeRound?.EventID, existingScores.length]);

  const loadRankings = async (roundId: string) => {
    if (!roundId) {
      setRankings([]);
      return;
    }

    setLoadingRankings(true);
    try {
      const data = await getRankings(roundId);
      setRankings(data);
    } catch (error) {
      console.error('Failed to load rankings:', error);
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  };

  useEffect(() => {
    if (selectedRoundId) {
      void loadRankings(selectedRoundId);
    }
  }, [selectedRoundId]);

  const calculateWeightedTotal = (): number => {
    return criteria.reduce((total, item) => total + (scores[item.CriteriaID] || 0) * item.Weight, 0);
  };

  const handleSubmitScores = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeSubmission || criteria.length === 0) return;

    setSubmitting(true);
    setMessage('');

    const scoreData = criteria.map((item) => ({
      CriteriaId: item.CriteriaID,
      ScoreValue: scores[item.CriteriaID] || 0,
      Comment: comments[item.CriteriaID] || '',
    }));

    try {
      if (hasExistingScores) {
        await updateScores(activeSubmission.SubmissionId, scoreData);
        setMessage(`Da cap nhat diem cho doi ${activeSubmission.TeamName}.`);
      } else {
        await submitScores(activeSubmission.SubmissionId, scoreData);
        setMessage(`Da luu diem cho doi ${activeSubmission.TeamName}.`);
      }
      void loadData();
    } catch (error) {
      console.error(error);
      setMessage('Khong the nop diem. Vui long kiem tra API Scores.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Judge Portal</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Cham diem truc tiep bang du lieu API backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab('scoring')}
              className={`flex items-center gap-1.5 rounded-l-xl px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'scoring'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Cham diem
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`flex items-center gap-1.5 rounded-r-xl px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'ranking'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Bang xep hang
            </button>
          </div>

          <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-xs font-semibold" onClick={loadData} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Tai lai
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : activeTab === 'scoring' ? (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Bai nop can danh gia ({submissions.length})
            </h3>

            <div className="space-y-3">
              {submissions.length === 0 ? (
                <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-4 text-xs text-slate-500">Chua co bai nop tu API.</CardContent>
                </Card>
              ) : (
                submissions.map((submission) => {
                  const isSelected = submission.SubmissionId === selectedSubId;
                  const round = rounds.find((item) => item.RoundID === submission.RoundId);

                  return (
                    <Card
                      key={submission.SubmissionId}
                      className={`cursor-pointer border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
                        isSelected ? 'ring-2 ring-emerald-600 dark:ring-emerald-400' : ''
                      }`}
                      onClick={() => setSelectedSubId(submission.SubmissionId)}
                    >
                      <div className="flex flex-col gap-2 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {submission.TeamName || 'Chua co thong tin doi'}
                          </h4>
                          <Badge className="border border-slate-200 bg-slate-50 text-[9px] text-slate-600">
                            Assigned
                          </Badge>
                        </div>
                        <p className="text-[10px] font-semibold uppercase text-slate-400">{round?.RoundName}</p>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            {activeSubmission ? (
              <form onSubmit={handleSubmitScores} className="space-y-6">
                <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">
                      Bai nop: {activeSubmission.TeamName}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">
                      Hang muc: {activeCategory?.CategoryName || 'Chua co category'} | Vong thi: {activeRound?.RoundName || 'Chua co round'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4 border-b border-slate-100 p-6 pt-0 dark:border-slate-800">
                    {activeSubmission.RepositoryURL && (
                      <a href={activeSubmission.RepositoryURL} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700">
                        <FileCode2 className="h-4 w-4 text-slate-500" />
                        Source
                      </a>
                    )}
                    {activeSubmission.DemoURL && (
                      <a href={activeSubmission.DemoURL} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-rose-600 hover:bg-slate-50 dark:border-slate-700">
                        <Video className="h-4 w-4" />
                        Demo
                      </a>
                    )}
                    {activeSubmission.SlideURL && (
                      <a href={activeSubmission.SlideURL} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        Slides
                      </a>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Criteria & Scores</h3>

                  {criteria.length === 0 ? (
                    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <CardContent className="p-6 text-xs text-slate-500">
                        Chua co criteria duoc cau hinh cho Event cua bai nop nay.
                      </CardContent>
                    </Card>
                  ) : (
                    criteria.map((item) => (
                      <Card key={item.CriteriaID} className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <CardContent className="p-6">
                          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.CriteriaName}</h4>
                                <Badge className="border border-indigo-100 bg-indigo-50 text-[9px] font-bold text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
                                  Weight: {item.Weight}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                step={0.1}
                                className="h-10 w-24 rounded-xl border-slate-200 text-center font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                                value={scores[item.CriteriaID] ?? 0}
                                onChange={(event) =>
                                  setScores((current) => ({
                                    ...current,
                                    [item.CriteriaID]: Math.min(100, Math.max(0, parseFloat(event.target.value) || 0)),
                                  }))
                                }
                                required
                              />
                              <span className="text-xs font-bold text-slate-400">/ 100</span>
                            </div>
                          </div>

                          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Comment
                            </label>
                            <textarea
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                              value={comments[item.CriteriaID] || ''}
                              onChange={(event) =>
                                setComments((current) => ({
                                  ...current,
                                  [item.CriteriaID]: event.target.value,
                                }))
                              }
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <Card className="overflow-hidden rounded-2xl border-none bg-slate-900 text-white shadow-md">
                  <CardContent className="flex flex-col items-center justify-between gap-4 p-6 md:flex-row">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                        <Award className="h-6 w-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Weighted total
                        </span>
                        <p className="text-2xl font-black text-white">{calculateWeightedTotal().toFixed(2)}</p>
                      </div>
                    </div>

                    {hasExistingScores && (
                      <div className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1.5">
                        <Edit2 className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">Da co diem - se cap nhat</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className={`h-11 w-full rounded-xl px-6 text-xs font-bold text-white transition-colors md:w-auto ${
                        hasExistingScores
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                      disabled={submitting || criteria.length === 0 || loadingScores}
                    >
                      {loadingScores ? (
                        'Dang tai...'
                      ) : hasExistingScores ? (
                        <>
                          <Save className="mr-2 h-3.5 w-3.5" />
                          Cap nhat diem
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3.5 w-3.5" />
                          Nop diem
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            ) : (
              <Card className="border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                Vui long chon bai nop de hien thi phieu cham diem.
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chon vong thi:</label>
            <select
              value={selectedRoundId}
              onChange={(e) => setSelectedRoundId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">-- Chon vong --</option>
              {rounds.map((round) => (
                <option key={round.RoundID} value={round.RoundID}>
                  {round.RoundName}
                </option>
              ))}
            </select>
          </div>

          {loadingRankings ? (
            <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ) : rankings.length === 0 ? (
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                {selectedRoundId ? 'Chua co du lieu xep hang cho vong nay.' : 'Vui long chon vong thi de xem bang xep hang.'}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Bang xep hang - {rounds.find((r) => r.RoundID === selectedRoundId)?.RoundName}</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Cap nhat theo thoi gian thuc khi co diem moi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hang</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Doi</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Diem tong</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings.map((ranking, index) => (
                        <tr
                          key={ranking.RankingId}
                          className={`border-b border-slate-50 dark:border-slate-800/50 ${
                            index < 3 ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            {index === 0 ? (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-xs font-black text-white">1</span>
                            ) : index === 1 ? (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-xs font-black text-slate-700">2</span>
                            ) : index === 2 ? (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-xs font-black text-white">3</span>
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                                {ranking.RankPosition || index + 1}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {ranking.Team?.TeamName || ranking.Team?.TeamID || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {ranking.TotalScore.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
