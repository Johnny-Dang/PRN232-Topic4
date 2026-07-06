'use client';

import React, { useMemo, useState } from 'react';
import { Send, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createCategoryMentorApi } from '@/services/api/mentor';
import { getApiErrorMessage, getAssignmentStatusClass, getCategoryName } from './helpers';
import type { CoordinatorCategory, CoordinatorMentorAssignment, CoordinatorMentorUser } from './types';

interface MentorAssignmentPanelProps {
  categories: CoordinatorCategory[];
  mentors: CoordinatorMentorUser[];
  assignments: CoordinatorMentorAssignment[];
  assignmentsLoading: boolean;
  selectedCategoryId: string;
  onSelectedCategoryChange: (categoryId: string) => void;
  onAssignmentCreated: (assignment: CoordinatorMentorAssignment) => void;
}

export default function MentorAssignmentPanel({
  categories,
  mentors,
  assignments,
  assignmentsLoading,
  selectedCategoryId,
  onSelectedCategoryChange,
  onAssignmentCreated,
}: MentorAssignmentPanelProps) {
  const [mentorUserId, setMentorUserId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const mentorById = useMemo(() => {
    return new Map(mentors.map((mentor) => [mentor.UserId, mentor]));
  }, [mentors]);

  const handleAssignMentor = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedCategoryId || !mentorUserId) return;

    setAssigning(true);
    setSuccess('');
    setError('');

    try {
      const createdAssignment = await createCategoryMentorApi({
        CategoryId: selectedCategoryId,
        UserId: mentorUserId,
      });

      onAssignmentCreated(createdAssignment);
      setMentorUserId('');
      setSuccess('Đã gửi yêu cầu phân công Mentor. Trạng thái hiện tại: Pending.');
    } catch (assignError: unknown) {
      console.error(assignError);
      setError(getApiErrorMessage(assignError, 'Không thể phân công Mentor cho Category đã chọn.'));
    } finally {
      setAssigning(false);
    }
  };

  const getMentorLabel = (assignment: CoordinatorMentorAssignment) => {
    if (assignment.MentorFullName || assignment.MentorEmail) {
      return `${assignment.MentorFullName || assignment.UserId}${assignment.MentorEmail ? ` (${assignment.MentorEmail})` : ''}`;
    }

    const mentor = mentorById.get(assignment.UserId);
    return mentor
      ? `${mentor.FullName} (${mentor.Email}${mentor.ShortId ? ` - ${mentor.ShortId}` : ''})`
      : assignment.UserId;
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-indigo-600 dark:text-indigo-400">
          <UserPlus className="h-5 w-5" />
          Phân công Mentor
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Gửi đề xuất Mentor phụ trách Category. Mentor sẽ nhận yêu cầu ở trạng thái Pending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6 pt-0">
        <form onSubmit={handleAssignMentor} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="mentor-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Category thi đấu
            </label>
            <select
              id="mentor-category"
              aria-label="Chọn Category thi đấu để phân công Mentor"
              title="Chọn Category thi đấu để phân công Mentor"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              value={selectedCategoryId}
              onChange={(event) => onSelectedCategoryChange(event.target.value)}
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Chưa tải được Category từ API</option>
              ) : (
                categories.map((category) => (
                  <option key={category.CategoryId} value={category.CategoryId}>
                    {category.CategoryName}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="mentor-user-id" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Mentor
            </label>
            <select
              id="mentor-user-id"
              aria-label="Chọn Mentor để phân công"
              title="Chọn Mentor để phân công"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              value={mentorUserId}
              onChange={(event) => setMentorUserId(event.target.value)}
              disabled={mentors.length === 0}
              required
            >
              <option value="">Chọn Mentor từ API</option>
              {mentors.map((mentor) => (
                <option key={mentor.UserId} value={mentor.UserId}>
                  {mentor.FullName} - {mentor.Email}{mentor.ShortId ? ` (${mentor.ShortId})` : ''}
                </option>
              ))}
            </select>
            {mentors.length === 0 && (
              <p className="text-[10px] font-medium text-amber-600">
                Chưa tải được danh sách Mentor từ API.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-10 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
              disabled={assigning || !selectedCategoryId || !mentorUserId}
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              {assigning ? 'Đang gửi...' : 'Gửi phân công'}
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Phân công của Category đang chọn
          </div>
          {assignmentsLoading ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              Đang tải phân công Mentor của Category...
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              Chưa có phân công Mentor cho Category này.
            </div>
          ) : (
            assignments.slice(0, 5).map((assignment) => (
              <div
                key={assignment.CategoryMentorId}
                className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                    {assignment.CategoryName || getCategoryName(categories, assignment.CategoryId)}
                  </span>
                  <Badge className={`border text-[9px] font-extrabold ${getAssignmentStatusClass(assignment.Status)}`}>
                    {assignment.Status}
                  </Badge>
                </div>
                <div className="truncate text-[10px] font-semibold text-slate-500">
                  Mentor: {getMentorLabel(assignment)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
