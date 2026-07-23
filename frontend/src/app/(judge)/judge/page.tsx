'use client';

import { useEffect, useState } from 'react';
import { ClientOnly } from '@/components/ClientOnly';
import { Award, BarChart3, ClipboardList, Edit2, FileCode2, FileText, RefreshCw, Save, Send, Target, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/contexts/ToastContext';
import { parseApiError } from '@/lib/errorHandler';
import {
  Category,
  Criteria,
  Event,
  Ranking,
  Round,
  Score,
  Team,
  getCategories,
  getEventCriteria,
  getEvents,
  getRounds,
  getAssignedSubmissions,
  getScores,
  getRankings,
  submitScores,
  updateScores,
  JudgeAssignedSubmission,
} from '@/lib/api';
import { useAutoDismissState } from '@/hooks/useAutoDismiss';
import { JudgeCalibrationList } from './components';

type TabType = 'scoring' | 'ranking' | 'calibration';

export default function JudgePage() {
  return (
    <ClientOnly>
      <JudgePageContent />
    </ClientOnly>
  );
}

function JudgePageContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('scoring');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useAutoDismissState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<JudgeAssignedSubmission[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [existingScores, setExistingScores] = useState<Score[]>([]);
  const [loadingScores, setLoadingScores] = useState(false);
  const [rankings, setRankings] = useState<(Ranking & { Team: Team })[]>([]);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');

  const activeSubmission = submissions.find((submission) => submission.submissionId === selectedSubId);
  const activeRound = activeSubmission ? rounds.find((round) => round.RoundID === activeSubmission.roundId) : null;
  const activeEvent = activeRound?.EventID ? events.find((e) => e.EventID === activeRound.EventID) : null;
  const activeCategory = activeSubmission?.categoryId
    ? categories.find((category) => category.CategoryID === activeSubmission.categoryId)
    : null;
  const uploadedVideoUrl = activeSubmission?.assets.find(
    (asset) => asset.AssetType === 'VideoDemo' && asset.SecureUrl,
  )?.SecureUrl;
  const uploadedDocumentUrl = activeSubmission?.assets.find(
    (asset) => asset.AssetType === 'SlideDocument' && asset.SecureUrl,
  )?.SecureUrl;
  const demoUrl = activeSubmission?.demoURL || uploadedVideoUrl;
  const documentUrl = activeSubmission?.slideURL || uploadedDocumentUrl;

  const hasExistingScores = existingScores.length > 0;

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [fetchedRounds, fetchedCategories, fetchedSubmissions, fetchedEvents] = await Promise.all([
        getRounds(),
        getCategories(),
        getAssignedSubmissions(),
        getEvents(),
      ]);

      setRounds(fetchedRounds);
      setCategories(fetchedCategories);
      setSubmissions(fetchedSubmissions);
      setEvents(fetchedEvents);
      setSelectedSubId(fetchedSubmissions[0]?.submissionId || '');

      if (fetchedRounds.length > 0 && !selectedRoundId) {
        setSelectedRoundId(fetchedRounds[0].RoundID);
      }
    } catch (error) {
      console.error(error);
      const { message, type } = parseApiError(error);
      showToast(message, type);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    const loadExistingScores = async () => {
      if (!activeSubmission) {
        setExistingScores([]);
        return;
      }

      setLoadingScores(true);
      try {
        const existing = await getScores(activeSubmission.submissionId);
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
        const { message, type } = parseApiError(error);
        showToast(message, type);
        setExistingScores([]);
      } finally {
        setLoadingScores(false);
      }
    };

    void loadExistingScores();
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  }, [selectedSubId, activeSubmission?.submissionId]);

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
      const { message, type } = parseApiError(error);
      showToast(message, type);
      setRankings([]);
    } finally {
      setLoadingRankings(false);
    }
  };

  useEffect(() => {
    if (selectedRoundId) {
      void loadRankings(selectedRoundId);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  }, [selectedRoundId]);

  const refreshRankings = async (): Promise<void> => {
    if (selectedRoundId) {
      await loadRankings(selectedRoundId);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    await Promise.all([loadData(), refreshRankings()]);
  };

  const handleTabChange = (tab: TabType): void => {
    setActiveTab(tab);

    if (tab === 'ranking') {
      void refreshRankings();
    }
  };

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
        await updateScores(activeSubmission.submissionId, scoreData);
        showToast(`Đã cập nhật điểm cho đội ${activeSubmission.teamName}.`, 'success');
      } else {
        await submitScores(activeSubmission.submissionId, scoreData);
        showToast(`Đã lưu điểm cho đội ${activeSubmission.teamName}.`, 'success');
      }
      await Promise.all([
        loadData(),
        selectedRoundId === activeSubmission.roundId
          ? loadRankings(selectedRoundId)
          : Promise.resolve(),
      ]);
    } catch (error) {
      console.error(error);
      const { message, type } = parseApiError(error);
      showToast(message, type);
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
            Chấm điểm nhất quán bằng dữ liệu API backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => handleTabChange('scoring')}
              className={`flex items-center gap-1.5 rounded-l-xl px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'scoring'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Chấm điểm
            </button>
            <button
              onClick={() => handleTabChange('ranking')}
              className={`flex items-center gap-1.5 rounded-r-xl px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'ranking'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Bảng xếp hạng
            </button>
            <button
              onClick={() => handleTabChange('calibration')}
              className={`flex items-center gap-1.5 rounded-r-xl px-3 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'calibration'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              Calibration
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
            onClick={() => void handleRefresh()}
            disabled={loading || loadingRankings || submitting}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading || loadingRankings ? 'animate-spin' : ''}`} />
            Tải lại
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
              Bài nộp cần đánh giá ({submissions.length})
            </h3>

            <div className="space-y-3">
              {submissions.length === 0 ? (
                <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <CardContent className="p-4 text-xs text-slate-500">Chưa có bài nộp từ API.</CardContent>
                </Card>
              ) : (
                submissions.map((submission) => {
                  const isSelected = submission.submissionId === selectedSubId;
                  const round = rounds.find((item) => item.RoundID === submission.roundId);
                  const event = round?.EventID ? events.find((e) => e.EventID === round.EventID) : null;

                  return (
                    <Card
                      key={submission.submissionId}
                      className={`cursor-pointer border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${
                        isSelected ? 'ring-2 ring-emerald-600 dark:ring-emerald-400' : ''
                      }`}
                      onClick={() => setSelectedSubId(submission.submissionId)}
                    >
                      <div className="flex flex-col gap-2 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {submission.teamName || 'Chưa có thông tin đội'}
                          </h4>
                          {(() => {
                            const hasScores = submission.scores && submission.scores.length > 0;
                            return (
                              <Badge className={`border text-[9px] font-semibold ${
                                hasScores
                                  ? 'border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-400'
                                  : 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-400'
                              }`}>
                                {hasScores ? 'Đã chấm' : 'Chưa chấm'}
                              </Badge>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-semibold text-slate-400">
                          {event && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">{event.EventName} • </span>
                          )}
                          <span>{round?.RoundName || 'Chưa có round'}</span>
                        </div>
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
                      Bài nộp: {activeSubmission.teamName}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-400">
                      Sự kiện: <span className="font-bold text-slate-700 dark:text-slate-200">{activeEvent?.EventName || 'Chưa xác định'}</span> | Hạng mục: {activeCategory?.CategoryName || 'Chưa có category'} | Vòng thi: {activeRound?.RoundName || 'Chưa có round'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4 border-b border-slate-100 p-6 pt-0 dark:border-slate-800">
                    {activeSubmission.repositoryURL && (
                      <a href={activeSubmission.repositoryURL} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700">
                        <FileCode2 className="h-4 w-4 text-slate-500" />
                        Source
                      </a>
                    )}
                    {demoUrl && (
                      <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-rose-600 hover:bg-slate-50 dark:border-slate-700">
                        <Video className="h-4 w-4" />
                        {activeSubmission.demoURL ? 'Demo' : 'Video'}
                      </a>
                    )}
                    {documentUrl && (
                      <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        {activeSubmission.slideURL ? 'Slides' : 'Tài liệu'}
                      </a>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tiêu chí & Điểm số (Criteria & Scores)</h3>

                  {criteria.length === 0 ? (
                    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                      <CardContent className="p-6 text-xs text-slate-500">
                        Chưa có tiêu chí (criteria) được cấu hình cho Sự kiện này.
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
                                  Trọng số: {item.Weight}
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
                              Nhận xét / Đánh giá
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
                          Điểm của tôi
                        </span>
                        <p className="text-2xl font-black text-white">{calculateWeightedTotal().toFixed(2)}</p>
                      </div>
                    </div>

                    {activeRound && rankings.find(r => r.Team?.TeamID === activeSubmission?.teamId) && (
                      <div className="flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-1.5">
                        <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">
                          TB tất cả: {rankings.find(r => r.Team?.TeamID === activeSubmission?.teamId)?.TotalScore?.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {hasExistingScores && (
                      <div className="flex items-center gap-2 rounded-lg bg-amber-500/20 px-3 py-1.5">
                        <Edit2 className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">Sẽ cập nhật</span>
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
                        'Đang tải...'
                      ) : hasExistingScores ? (
                        <>
                          <Save className="mr-2 h-3.5 w-3.5" />
                          Cập nhật điểm
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3.5 w-3.5" />
                          Nộp điểm
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            ) : (
              <Card className="border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                Vui lòng chọn bài nộp để hiển thị phiếu chấm điểm.
              </Card>
            )}
          </div>
        </div>
      ) : activeTab === 'ranking' ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Chọn vòng thi:</label>
            <select
              value={selectedRoundId}
              onChange={(e) => setSelectedRoundId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="">-- Chọn vòng --</option>
              {rounds.map((round) => {
                const event = events.find((e) => e.EventID === round.EventID);
                return (
                  <option key={round.RoundID} value={round.RoundID}>
                    {round.RoundName}{event ? ` (${event.EventName})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {loadingRankings ? (
            <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ) : rankings.length === 0 ? (
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-8 text-center text-xs text-slate-500">
                {selectedRoundId ? 'Chưa có dữ liệu xếp hạng cho vòng này.' : 'Vui lòng chọn vòng thi để xem bảng xếp hạng.'}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Bảng xếp hạng - {rounds.find((r) => r.RoundID === selectedRoundId)?.RoundName}</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Cập nhật theo thời gian thực khi có điểm mới
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Hạng</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Đội</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Điểm tổng</th>
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
      ) : activeTab === 'calibration' ? (
        <div className="space-y-6">
          <JudgeCalibrationList />
        </div>
      ) : null}
    </div>
  );
}
