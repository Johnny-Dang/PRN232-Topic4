'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Clock, MessageSquare, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { bookMentoringApi, getAvailableSchedulesForCategoryApi, getMyBookingsApi, getTeamFeedbacksApi } from '@/services/api/mentorship';
import type { MentorBooking, MentoringFeedback, MentorSchedule } from '@/services/types/mentorship';

interface MentoringBookingPanelProps {
  categoryId?: string;
  teamId?: string;
}

export default function MentoringBookingPanel({ categoryId, teamId }: MentoringBookingPanelProps) {
  const [availableSchedules, setAvailableSchedules] = useState<MentorSchedule[]>([]);
  const [myBookings, setMyBookings] = useState<MentorBooking[]>([]);
  const [teamFeedbacks, setTeamFeedbacks] = useState<MentoringFeedback[]>([]);

  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [objective, setObjective] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadMentoringData = useCallback(async () => {
    setError('');
    try {
      const [bookingsData, feedbackData] = await Promise.all([
        getMyBookingsApi().catch(() => []),
        teamId ? getTeamFeedbacksApi(teamId).catch(() => []) : Promise.resolve([]),
      ]);

      setMyBookings(bookingsData);
      setTeamFeedbacks(feedbackData);

      if (categoryId) {
        const schedulesData = await getAvailableSchedulesForCategoryApi(categoryId).catch(() => []);
        setAvailableSchedules(schedulesData);
        if (schedulesData.length > 0) {
          setSelectedScheduleId((current) => current || schedulesData[0].scheduleId);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Không thể tải thông tin đặt lịch tư vấn.');
    }
  }, [categoryId, teamId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMentoringData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMentoringData]);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId || !objective.trim()) {
      setError('Vui lòng chọn khung giờ rảnh và điền mục tiêu tư vấn.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await bookMentoringApi({
        scheduleId: selectedScheduleId,
        objective: objective.trim(),
      });
      setMessage('Đặt lịch tư vấn với Mentor thành công!');
      setObjective('');
      await loadMentoringData();
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        setError(res?.data?.message || 'Không thể đặt lịch tư vấn.');
      } else {
        setError('Không thể đặt lịch tư vấn.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Booking Form Card */}
      <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Đặt Lịch Hẹn Mentoring Với Mentor
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            Xem danh sách thời gian rảnh của các Mentor thuộc Category của bạn và đặt lịch hỗ trợ chuyên môn.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          {error && <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</div>}
          {message && <div className="rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{message}</div>}

          <form onSubmit={handleBookSlot} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Chọn Khung Giờ Rảnh Của Mentor
              </label>
              <select
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                disabled={availableSchedules.length === 0}
              >
                {availableSchedules.length === 0 ? (
                  <option value="">Không có khung giờ rảnh nào khả dụng</option>
                ) : (
                  availableSchedules.map((sch) => (
                    <option key={sch.scheduleId} value={sch.scheduleId}>
                      Mentor: {sch.mentorName} | {new Date(sch.startTime).toLocaleString('vi-VN')} - {new Date(sch.endTime).toLocaleTimeString('vi-VN')} {sch.meetingLocation ? `(${sch.meetingLocation})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mục Tiêu Buổi Mentoring
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Review kiến trúc database, Review Business Model..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-10 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white hover:bg-indigo-700"
                disabled={submitting || availableSchedules.length === 0}
              >
                <Send className="mr-2 h-3.5 w-3.5" />
                {submitting ? 'Đang đặt lịch...' : 'Gửi Yêu Cầu Đặt Lịch'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Booking History & Feedbacks Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <Clock className="h-4 w-4 text-indigo-600" />
              Lịch Hẹn Của Đội Thi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {myBookings.length === 0 ? (
              <p className="text-xs text-slate-400">Đội của bạn chưa từng đặt lịch tư vấn.</p>
            ) : (
              myBookings.map((b) => (
                <div key={b.bookingId} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mentor: {b.mentorName}</span>
                    <Badge className="text-[9px] font-extrabold">{b.status}</Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300"><strong>Mục tiêu:</strong> {b.objective}</p>
                  <p className="text-slate-400 text-[10px]">{new Date(b.startTime).toLocaleString('vi-VN')}</p>
                  {b.meetingLink && (
                    <p className="text-[11px] text-indigo-600 font-semibold truncate">Link: {b.meetingLink}</p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              Nhận Xét & Checkpoints Từ Mentor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {teamFeedbacks.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có nhận xét checkpoint từ Mentor.</p>
            ) : (
              teamFeedbacks.map((f) => (
                <div key={f.feedbackId} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Mentor: {f.mentorName}</span>
                    <Badge
                      className={
                        f.healthStatus === 'Red'
                          ? 'bg-rose-500 text-white font-bold text-[9px]'
                          : f.healthStatus === 'Yellow'
                          ? 'bg-amber-500 text-white font-bold text-[9px]'
                          : 'bg-emerald-500 text-white font-bold text-[9px]'
                      }
                    >
                      {f.healthStatus}
                    </Badge>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 italic">&quot;{f.content}&quot;</p>
                  <p className="text-slate-400 text-[10px]">{new Date(f.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
