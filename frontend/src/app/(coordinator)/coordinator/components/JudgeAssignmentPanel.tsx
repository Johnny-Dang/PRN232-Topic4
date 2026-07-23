'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, UserCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Event, JudgeAssignment, Round, User, getEvents, getJudgeAssignments, getRounds, getUsersByRole, assignJudge, removeJudgeAssignment } from '@/lib/api';

export default function JudgeAssignmentPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [judges, setJudges] = useState<User[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [selectedJudgeId, setSelectedJudgeId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedAssignments, fetchedRounds, fetchedJudges, fetchedEvents] = await Promise.all([
        getJudgeAssignments(),
        getRounds(),
        getUsersByRole('Judge'),
        getEvents(),
      ]);
      setAssignments(fetchedAssignments);
      setRounds(fetchedRounds);
      setJudges(fetchedJudges);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  const getEventName = (eventId: string) => {
    const ev = events.find((e) => e.EventID === eventId);
    return ev ? `${ev.EventName} (${ev.Season} ${ev.Year})` : '';
  };

  const activeRounds = rounds.filter((round) => {
    const endDate = round.EndDate ? new Date(round.EndDate) : null;
    const isNotEnded = !endDate || endDate > new Date();
    const matchesEvent = !selectedEventId || round.EventID === selectedEventId;
    return isNotEnded && matchesEvent;
  });

  useEffect(() => {
    void loadData();
  }, []);

  const roundsWithJudges = rounds.map((round) => ({
    round,
    judges: assignments
      .filter((a) => a.RoundId === round.RoundID)
      .map((a) => a),
  }));

  const filteredRoundsWithJudges = roundsWithJudges.filter(({ round }) =>
    !selectedEventId || round.EventID === selectedEventId
  );

  const availableJudgesForRound = (roundId: string) => {
    const assignedUserIds = assignments
      .filter((a) => a.RoundId === roundId)
      .map((a) => a.UserId);
    return judges.filter((j) =>
      j.AccountStatus?.toLowerCase() === 'active' &&
      !assignedUserIds.includes(j.UserID)
    );
  };

  const handleAssignJudge = async () => {
    if (!selectedRoundId || !selectedJudgeId) {
      setMessage('Vui lòng chọn đủ thông tin.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await assignJudge(selectedJudgeId, selectedRoundId);
      setMessage('Đã phân công judge thành công!');
      const updatedAssignments = await getJudgeAssignments();
      setAssignments(updatedAssignments);
      setSelectedJudgeId('');
    } catch (error: unknown) {
      console.error('Failed to assign judge:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
      setMessage(errorMessage || 'Không thể phân công judge. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string, userId: string, roundId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phân công này?')) return;

    setSaving(true);
    setMessage('');

    try {
      await removeJudgeAssignment(assignmentId);
      setMessage('Đã xóa phân công thành công!');
      // Refresh assignments from server to ensure data consistency
      const updatedAssignments = await getJudgeAssignments();
      setAssignments(updatedAssignments);
      // Clear selected judge if it was the one being removed
      if (selectedJudgeId === userId && selectedRoundId === roundId) {
        setSelectedJudgeId('');
      }
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      setMessage('Không thể xóa phân công. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Phân công Judge cho vòng thi</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
                Lọc theo sự kiện và gán judge cho các vòng thi tương ứng để chấm điểm
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadData()}
              disabled={loading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Sự kiện</Label>
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSelectedRoundId('');
                  setSelectedJudgeId('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">-- Tất cả sự kiện --</option>
                {events.map((ev) => (
                  <option key={ev.EventID} value={ev.EventID}>
                    {ev.EventName} ({ev.Season} {ev.Year})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Vòng thi</Label>
              <select
                value={selectedRoundId}
                onChange={(e) => {
                  setSelectedRoundId(e.target.value);
                  setSelectedJudgeId('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">-- Chọn vòng --</option>
                {activeRounds.map((round) => {
                  const eventName = getEventName(round.EventID);
                  return (
                    <option key={round.RoundID} value={round.RoundID}>
                      {round.RoundName}{eventName && !selectedEventId ? ` (${eventName})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Judge</Label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                disabled={!selectedRoundId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
              >
                <option value="">-- Chọn judge --</option>
                {selectedRoundId &&
                  availableJudgesForRound(selectedRoundId).map((judge) => (
                    <option key={judge.UserID} value={judge.UserID}>
                      {judge.FullName} ({judge.Email})
                    </option>
                  ))}
                {selectedRoundId && availableJudgesForRound(selectedRoundId).length === 0 && (
                  <option disabled>Tất cả judges đã được phân công</option>
                )}
              </select>
            </div>
          </div>

          <Button
            onClick={handleAssignJudge}
            disabled={saving || !selectedRoundId || !selectedJudgeId}
            className="h-10 rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Phân công Judge
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Danh sách phân công hiện tại {selectedEventId ? `(Đã lọc theo sự kiện)` : ''}
        </h3>
        
        {filteredRoundsWithJudges
          .filter(({ judges: roundJudges }) => roundJudges.length > 0)
          .length === 0 ? (
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-8 text-center text-xs text-slate-500">
              Chưa có phân công judge nào{selectedEventId ? ' cho sự kiện này' : ''}.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredRoundsWithJudges
              .filter(({ judges: roundJudges }) => roundJudges.length > 0)
              .map(({ round, judges: roundJudges }) => {
                const eventName = getEventName(round.EventID);
                return (
                  <Card key={round.RoundID} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-sm font-bold flex items-center gap-2 flex-wrap">
                            <span>{round.RoundName}</span>
                            {eventName && (
                              <Badge variant="outline" className="text-[10px] font-medium border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                {eventName}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {roundJudges.length} judge được phân công
                          </CardDescription>
                        </div>
                        <Badge className="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                          {roundJudges.length}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {roundJudges.map((assignment) => (
                          <div
                            key={assignment.AssignmentId}
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
                          >
                            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {assignment.UserFullName || 'Unknown'}
                            </span>
                            <button
                              onClick={() => handleRemoveAssignment(assignment.AssignmentId, assignment.UserId, assignment.RoundId)}
                              disabled={saving}
                              className="ml-1 text-rose-400 hover:text-rose-600 disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {message && (
        <div className={`rounded-xl border p-3 text-xs font-medium ${
          message.includes('thành công')
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
            : 'border-rose-100 bg-rose-50 text-rose-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
