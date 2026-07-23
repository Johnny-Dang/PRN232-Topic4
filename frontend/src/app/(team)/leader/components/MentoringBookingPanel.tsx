'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, MessageSquare, Send, History, ExternalLink, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { bookMentoringApi, getAvailableSchedulesForCategoryApi, getMyBookingsApi, getTeamFeedbacksApi } from '@/services/api/mentorship';
import type { MentorBooking, MentoringFeedback, MentorSchedule } from '@/services/types/mentorship';
import { useAutoDismissState } from '@/hooks/useAutoDismiss';
import { cn } from '@/lib/utils';

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
  const [error, setError] = useAutoDismissState('');
  const [message, setMessage] = useAutoDismissState('');

  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'ACCEPTED' | 'COMPLETED' | 'PENDING' | 'REJECTED'>('ALL');
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<MentorBooking | null>(null);

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
  }, [categoryId, teamId, setError]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMentoringData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMentoringData]);

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'ALL') return myBookings;
    return myBookings.filter((b) => (b.status || '').toUpperCase() === bookingFilter);
  }, [myBookings, bookingFilter]);

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toUpperCase();
    switch (normalized) {
      case 'ACCEPTED':
        return <Badge className="bg-indigo-600 text-white font-extrabold text-[9px]">ACCEPTED</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-purple-600 text-white font-extrabold text-[9px]">COMPLETED</Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-500 text-white font-extrabold text-[9px]">PENDING</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge className="bg-rose-500 text-white font-extrabold text-[9px]">REJECTED</Badge>;
      default:
        return <Badge className="bg-slate-500 text-white font-extrabold text-[9px]">{status}</Badge>;
    }
  };

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
                      Mentor: {sch.mentorName} | {new Date(sch.startTime).toLocaleString('vi-VN')} - {new Date(sch.endTime).toLocaleTimeString('vi-VN')}
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
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Lịch Sử Lịch Hẹn Mentoring ({myBookings.length})
              </CardTitle>
              {myBookings.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {(['ALL', 'ACCEPTED', 'COMPLETED', 'PENDING'] as const).map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setBookingFilter(filterKey)}
                      className={cn(
                        'px-2 py-0.5 rounded-lg text-[9px] font-bold transition-all',
                        bookingFilter === filterKey
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      {filterKey === 'ALL'
                        ? `Tất cả (${myBookings.length})`
                        : filterKey === 'ACCEPTED'
                        ? 'Đã duyệt'
                        : filterKey === 'COMPLETED'
                        ? 'Hoàn thành'
                        : 'Chờ duyệt'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {filteredBookings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                {myBookings.length === 0
                  ? 'Đội của bạn chưa từng đặt lịch tư vấn.'
                  : 'Không có lịch hẹn nào khớp bộ lọc.'}
              </p>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.bookingId}
                  onClick={() => setSelectedBookingForModal(b)}
                  className="group rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs transition-all hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm cursor-pointer dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-800 space-y-1.5"
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      Mentor: {b.mentorName || 'Mentor phụ trách'}
                    </span>
                    {getStatusBadge(b.status)}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                    <strong className="text-slate-800 dark:text-slate-200">Mục tiêu:</strong> {b.objective || 'Chưa cập nhật'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-indigo-500" />
                      {new Date(b.startTime).toLocaleString('vi-VN')}
                    </span>
                    {b.meetingLink && (b.status === 'ACCEPTED' || b.status === 'COMPLETED') && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> Meet Link
                      </a>
                    )}
                  </div>
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

      {/* Appointment Detail Modal */}
      {selectedBookingForModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setSelectedBookingForModal(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Chi Tiết Lịch Hẹn Mentoring
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full p-0"
                onClick={() => setSelectedBookingForModal(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Mentor phụ trách</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {selectedBookingForModal.mentorName || 'Mentor phụ trách'}
                  </span>
                </div>
                {getStatusBadge(selectedBookingForModal.status)}
              </div>

              <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Mục tiêu buổi làm việc</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                  {selectedBookingForModal.objective || 'Chưa cập nhật mục tiêu.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Thời gian bắt đầu</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(selectedBookingForModal.startTime).toLocaleString('vi-VN')}
                  </span>
                </div>
                {selectedBookingForModal.endTime && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">Thời gian kết thúc</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {new Date(selectedBookingForModal.endTime).toLocaleString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              {selectedBookingForModal.meetingLink && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/30 space-y-2">
                  <span className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-bold block">
                    Đường dẫn phòng họp Google Meet
                  </span>
                  <a
                    href={selectedBookingForModal.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-extrabold text-indigo-600 hover:underline dark:text-indigo-400 break-all"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    {selectedBookingForModal.meetingLink}
                  </a>
                </div>
              )}

              {selectedBookingForModal.notes && (
                <div className="space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Ghi chú từ Mentor</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 italic">
                    &quot;{selectedBookingForModal.notes}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/50">
              <Button
                type="button"
                variant="outline"
                className="h-8 rounded-lg text-xs font-semibold"
                onClick={() => setSelectedBookingForModal(null)}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
