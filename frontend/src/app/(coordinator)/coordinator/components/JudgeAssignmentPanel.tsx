'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { JudgeAssignment, Round, User, getJudgeAssignments, getRounds, getUsersByRole, assignJudge, removeJudgeAssignment } from '@/lib/api';

export default function JudgeAssignmentPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [judges, setJudges] = useState<User[]>([]);
  const [selectedRoundId, setSelectedRoundId] = useState('');
  const [selectedJudgeId, setSelectedJudgeId] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedAssignments, fetchedRounds, fetchedJudges] = await Promise.all([
          getJudgeAssignments(),
          getRounds(),
          getUsersByRole('Judge'),
        ]);
        setAssignments(fetchedAssignments);
        setRounds(fetchedRounds);
        setJudges(fetchedJudges);
      } catch (error) {
        console.error('Failed to load data:', error);
        setMessage('Khong the tai du lieu.');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const roundsWithJudges = rounds.map((round) => ({
    round,
    judges: assignments
      .filter((a) => a.RoundId === round.RoundID)
      .map((a) => ({
        ...a,
        user: judges.find((j) => j.UserID === a.UserId),
      })),
  }));

  const availableJudgesForRound = (roundId: string) => {
    const assignedUserIds = assignments
      .filter((a) => a.RoundId === roundId)
      .map((a) => a.UserId);
    return judges.filter((j) => !assignedUserIds.includes(j.UserID));
  };

  const handleAssignJudge = async () => {
    if (!selectedRoundId || !selectedJudgeId) {
      setMessage('Vui long chon du thong tin.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await assignJudge(selectedJudgeId, selectedRoundId);
      setMessage('Da phan cong judge thanh cong!');
      const updatedAssignments = await getJudgeAssignments();
      setAssignments(updatedAssignments);
      setSelectedJudgeId('');
    } catch (error) {
      console.error('Failed to assign judge:', error);
      setMessage('Khong the phan cong judge. Vui long thu lai.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm('Ban co chac chan muon xoa phan cong nay?')) return;

    setSaving(true);
    setMessage('');

    try {
      await removeJudgeAssignment(assignmentId);
      setMessage('Da xoa phan cong thanh cong!');
      setAssignments((current) => current.filter((a) => a.AssignmentId !== assignmentId));
    } catch (error) {
      console.error('Failed to remove assignment:', error);
      setMessage('Khong the xoa phan cong. Vui long thu lai.');
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
          <CardTitle className="text-base font-bold">Phan cong Judge cho vong thi</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">
            Gan judge cho cac vong thi de cham diem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Vong thi</Label>
              <select
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
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

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Judge</Label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                disabled={!selectedRoundId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
              >
                <option value="">-- Chon judge --</option>
                {selectedRoundId &&
                  availableJudgesForRound(selectedRoundId).map((judge) => (
                    <option key={judge.UserID} value={judge.UserID}>
                      {judge.FullName} ({judge.Email})
                    </option>
                  ))}
                {selectedRoundId && availableJudgesForRound(selectedRoundId).length === 0 && (
                  <option disabled>Tat ca judges da duoc phan cong</option>
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
            Phan cong Judge
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Danh sach phan cong hien tai</h3>
        
        {roundsWithJudges.length === 0 ? (
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-8 text-center text-xs text-slate-500">
              Chua co vong thi nao.
            </CardContent>
          </Card>
        ) : (
          roundsWithJudges.map(({ round, judges: roundJudges }) => (
            <Card key={round.RoundID} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">{round.RoundName}</CardTitle>
                    <CardDescription className="text-xs">
                      {roundJudges.length} judge{roundJudges.length !== 1 ? '' : ''} duoc phan cong
                    </CardDescription>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                    {roundJudges.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {roundJudges.length === 0 ? (
                  <p className="text-xs text-slate-400">Chua co judge nao duoc phan cong cho vong nay.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {roundJudges.map((assignment) => (
                      <div
                        key={assignment.AssignmentId}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {assignment.user?.FullName || 'Unknown'}
                        </span>
                        <button
                          onClick={() => handleRemoveAssignment(assignment.AssignmentId)}
                          className="ml-1 text-rose-400 hover:text-rose-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {message && (
        <div className={`rounded-xl border p-3 text-xs font-medium ${
          message.includes('thanh cong')
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
            : 'border-rose-100 bg-rose-50 text-rose-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
