'use client';

import { useEffect, useState } from 'react';
import { Award, FileCode2, FileText, RefreshCw, Send, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Category,
  Criteria,
  Round,
  Submission,
  Team,
  getCategories,
  getEventCriteria,
  getRounds,
  getSubmissions,
  submitScores,
} from '@/lib/api';

export default function JudgePage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<(Submission & { Team: Team })[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);

  const activeSubmission = submissions.find((submission) => submission.SubmissionID === selectedSubId);
  const activeRound = activeSubmission ? rounds.find((round) => round.RoundID === activeSubmission.RoundID) : null;
  const activeCategory = activeSubmission
    ? categories.find((category) => category.CategoryID === activeSubmission.Team.CategoryID)
    : null;

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [fetchedRounds, fetchedCategories, fetchedSubmissions] = await Promise.all([
        getRounds(),
        getCategories(),
        getSubmissions(),
      ]);
      const activeSubmissions = fetchedSubmissions.filter((submission) => submission.Status !== 'Disqualified');

      setRounds(fetchedRounds);
      setCategories(fetchedCategories);
      setSubmissions(activeSubmissions);
      setSelectedSubId(activeSubmissions[0]?.SubmissionID || '');
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
    const loadCriteria = async () => {
      if (!activeRound?.EventID) {
        setCriteria([]);
        return;
      }

      const fetchedCriteria = await getEventCriteria(activeRound.EventID);
      setCriteria(fetchedCriteria);
      setScores(Object.fromEntries(fetchedCriteria.map((item) => [item.CriteriaID, 0])));
      setComments(Object.fromEntries(fetchedCriteria.map((item) => [item.CriteriaID, ''])));
      setMessage('');
    };

    void loadCriteria();
  }, [activeRound?.EventID]);

  const calculateWeightedTotal = (): number => {
    return criteria.reduce((total, item) => total + (scores[item.CriteriaID] || 0) * item.Weight, 0);
  };

  const handleSubmitScores = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!activeSubmission || criteria.length === 0) return;

    setSubmitting(true);
    setMessage('');

    try {
      await submitScores(
        activeSubmission.SubmissionID,
        criteria.map((item) => ({
          CriteriaId: item.CriteriaID,
          ScoreValue: scores[item.CriteriaID] || 0,
          Comment: comments[item.CriteriaID] || '',
        }))
      );
      setMessage(`Da luu diem cho doi ${activeSubmission.Team.TeamName || activeSubmission.Team.TeamID}.`);
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
        <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-xs font-semibold" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tai lai du lieu
        </Button>
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
      ) : (
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
                  const isSelected = submission.SubmissionID === selectedSubId;
                  const round = rounds.find((item) => item.RoundID === submission.RoundID);

                  return (
                    <Card
                      key={submission.SubmissionID}
                      className={`cursor-pointer border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
                        isSelected ? 'ring-2 ring-emerald-600 dark:ring-emerald-400' : ''
                      }`}
                      onClick={() => setSelectedSubId(submission.SubmissionID)}
                    >
                      <div className="flex flex-col gap-2 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {submission.Team.TeamName || submission.Team.TeamID || 'Chua co thong tin doi'}
                          </h4>
                          <Badge className="border border-slate-200 bg-slate-50 text-[9px] text-slate-600">
                            {submission.Status}
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
                      Bai nop: {activeSubmission.Team.TeamName || activeSubmission.Team.TeamID}
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

                    <Button
                      type="submit"
                      className="h-11 w-full rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white transition-colors hover:bg-emerald-700 md:w-auto"
                      disabled={submitting || criteria.length === 0}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {submitting ? 'Dang gui...' : 'Nop diem'}
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
      )}
    </div>
  );
}
