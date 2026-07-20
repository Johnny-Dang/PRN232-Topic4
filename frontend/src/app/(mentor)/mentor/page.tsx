'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  approveCategoryMentorApi,
  getMentorAssignmentsApi,
  getMentorCategoriesApi,
  getMentorTeamsApi,
  rejectCategoryMentorApi,
} from '@/services/api/mentor';
import {
  createMentoringFeedbackApi,
  createMentorScheduleApi,
  deleteMentorScheduleApi,
  getMyBookingsApi,
  getMyMentorSchedulesApi,
  updateBookingStatusApi,
} from '@/services/api/mentorship';
import type { CategoryMentor, MentorCategory, MentorTeam } from '@/services/types/mentor';
import type { MentorBooking, MentorSchedule } from '@/services/types/mentorship';

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;

  const response = (error as { response?: { data?: { message?: string } } }).response;
  return response?.data?.message || fallback;
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa có ngày' : date.toLocaleString('vi-VN');
};

function MentorDashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'assignments';

  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Data lists
  const [assignments, setAssignments] = useState<CategoryMentor[]>([]);
  const [categories, setCategories] = useState<MentorCategory[]>([]);
  const [teams, setTeams] = useState<MentorTeam[]>([]);
  const [schedules, setSchedules] = useState<MentorSchedule[]>([]);
  const [bookings, setBookings] = useState<MentorBooking[]>([]);

  // Create schedule form state
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  // Feedback form state
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [healthStatus, setHealthStatus] = useState<'Green' | 'Yellow' | 'Red'>('Green');
  const [feedbackText, setFeedbackText] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const [fetchedAssignments, fetchedCategories, fetchedTeams, fetchedSchedules, fetchedBookings] =
        await Promise.all([
          getMentorAssignmentsApi().catch(() => []),
          getMentorCategoriesApi().catch(() => []),
          getMentorTeamsApi().catch(() => []),
          getMyMentorSchedulesApi().catch(() => []),
          getMyBookingsApi().catch(() => []),
        ]);

      setAssignments(fetchedAssignments);
      setCategories(fetchedCategories);
      setTeams(fetchedTeams);
      setSchedules(fetchedSchedules);
      setBookings(fetchedBookings);

      if (fetchedBookings.length > 0) {
        setSelectedBookingId((current) => current || fetchedBookings[0].bookingId);
      }
    } catch (loadError: unknown) {
      console.error(loadError);
      setError(getApiErrorMessage(loadError, 'Không thể tải dữ liệu Mentor từ API.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const handleAssignmentDecision = async (categoryMentorId: string, decision: 'approve' | 'reject') => {
    setError('');
    setMessage('');

    try {
      await (decision === 'approve'
        ? approveCategoryMentorApi(categoryMentorId)
        : rejectCategoryMentorApi(categoryMentorId));

      setMessage(decision === 'approve' ? 'Đã chấp thuận phân công Mentor.' : 'Đã từ chối phân công Mentor.');
      await loadData();
    } catch (actionError: unknown) {
      console.error(actionError);
      setError(getApiErrorMessage(actionError, 'Không thể cập nhật trạng thái phân công Mentor.'));
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      setError('Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }

    try {
      setError('');
      setMessage('');
      await createMentorScheduleApi({
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        meetingLocation: location.trim() || undefined,
      });
      setMessage('Tạo khung giờ rảnh thành công!');
      setStartTime('');
      setEndTime('');
      setLocation('');
      await loadData();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Không thể tạo khung giờ rảnh.'));
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      setError('');
      setMessage('');
      await deleteMentorScheduleApi(scheduleId);
      setMessage('Đã xóa khung giờ rảnh.');
      await loadData();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Không thể xóa khung giờ rảnh.'));
    }
  };

  const handleBookingStatusChange = async (bookingId: string, status: string, link?: string) => {
    try {
      setError('');
      setMessage('');
      await updateBookingStatusApi(bookingId, {
        status,
        meetingLink: link,
      });
      setMessage(`Đã cập nhật trạng thái lịch hẹn thành ${status}.`);
      await loadData();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Không thể cập nhật trạng thái lịch hẹn.'));
    }
  };

  const handleSendFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!feedbackText.trim() || !selectedBookingId) {
      setError('Vui lòng chọn lịch hẹn và nhập nội dung feedback.');
      return;
    }

    setSubmittingFeedback(true);
    setError('');
    setMessage('');

    try {
      await createMentoringFeedbackApi({
        bookingId: selectedBookingId,
        healthStatus,
        content: feedbackText.trim(),
      });
      setMessage(`Gửi feedback Checkpoint thành công! Đã cập nhật Health Status của đội thi thành ${healthStatus}.`);
      setFeedbackText('');
      await loadData();
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Không thể gửi feedback Checkpoint.'));
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Cổng Cố Vấn Học Thuật (Mentorship Portal)
          </h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Thiết lập lịch rảnh, duyệt yêu cầu tư vấn, ghi nhận feedback checkpoint và đánh giá tiến độ sức khỏe các đội thi.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
          onClick={loadData}
          disabled={loading}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Tải lại dữ liệu
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
          {message}
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="w-full space-y-6">
          {/* Tab: Schedules */}
          {activeTab === 'schedules' && (
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-bold">
                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Tạo Slot Thời Gian Rảnh
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-400">
                    Cung cấp thời gian rảnh để các Đội thi thuộc Category của bạn đăng ký tư vấn.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <form onSubmit={handleCreateSchedule} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">Thời gian bắt đầu</label>
                      <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">Thời gian kết thúc</label>
                      <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-500">Địa điểm / Meeting Link</label>
                      <input
                        type="text"
                        placeholder="Google Meet link hoặc Phòng học"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="submit" className="h-10 w-full rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700">
                        <Plus className="mr-1.5 h-4 w-4" /> Tạo khung giờ
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Danh Sách Lịch Rảnh Của Bạn</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {schedules.length === 0 ? (
                    <p className="text-xs text-slate-400">Bạn chưa tạo khung giờ rảnh nào.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                      <Table>
                        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                          <TableRow>
                            <TableHead className="text-xs font-bold">Bắt đầu</TableHead>
                            <TableHead className="text-xs font-bold">Kết thúc</TableHead>
                            <TableHead className="text-xs font-bold">Địa điểm / Link</TableHead>
                            <TableHead className="text-xs font-bold">Trạng thái</TableHead>
                            <TableHead className="text-xs font-bold">Thao tác</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {schedules.map((sch) => (
                            <TableRow key={sch.scheduleId}>
                              <TableCell className="text-xs font-semibold">{formatDate(sch.startTime)}</TableCell>
                              <TableCell className="text-xs font-semibold">{formatDate(sch.endTime)}</TableCell>
                              <TableCell className="text-xs">{sch.meetingLocation || 'N/A'}</TableCell>
                              <TableCell>
                                {sch.isBooked ? (
                                  <Badge className="bg-amber-500 text-white font-bold text-[10px]">Đã được đặt</Badge>
                                ) : (
                                  <Badge className="bg-emerald-500 text-white font-bold text-[10px]">Đang rảnh</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {!sch.isBooked && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSchedule(sch.scheduleId)}
                                    className="h-8 rounded-lg text-rose-600 hover:bg-rose-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab: Bookings */}
          {activeTab === 'bookings' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Lịch Hẹn Mentoring Từ Các Đội Thi
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Duyệt hoặc từ chối các buổi tư vấn do Đội thi đặt lịch.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {bookings.length === 0 ? (
                  <p className="text-xs text-slate-400">Chưa có yêu cầu đặt lịch nào.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.bookingId} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/30">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{booking.teamName}</h4>
                              <Badge className="border bg-indigo-50 text-[10px] font-bold text-indigo-700">{booking.status}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                              <span className="font-semibold text-slate-500">Mục tiêu:</span> {booking.objective}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Khung giờ: {formatDate(booking.startTime)} - {formatDate(booking.endTime)}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {booking.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleBookingStatusChange(booking.bookingId, 'ACCEPTED')}
                                  className="h-8 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                                >
                                  Chấp nhận
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBookingStatusChange(booking.bookingId, 'REJECTED')}
                                  className="h-8 rounded-xl border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50"
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab: Assignments */}
          {activeTab === 'assignments' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Yêu cầu phân công
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Xác nhận hoặc từ chối đề xuất phụ trách Category từ Coordinator.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6 pt-0">
                {assignments.length === 0 ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                    Chưa có yêu cầu phân công từ API.
                  </div>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.CategoryMentorId} className="flex items-center justify-between rounded-xl border p-4">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{assignment.CategoryName}</h4>
                        <p className="text-xs text-slate-500">Trạng thái: {assignment.Status}</p>
                      </div>
                      {assignment.Status === 'Pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAssignmentDecision(assignment.CategoryMentorId, 'approve')}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleAssignmentDecision(assignment.CategoryMentorId, 'reject')}>Reject</Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Tab: Categories */}
          {activeTab === 'categories' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Hạng mục phụ trách</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {categories.map((cat) => (
                  <div key={cat.CategoryId} className="p-3 border-b">
                    <p className="font-bold">{cat.CategoryName}</p>
                    <p className="text-xs text-slate-500">{cat.EventName}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tab: Feedback Form & Checkpoint */}
          {activeTab === 'feedback-form' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Gửi Phản Hồi & Đánh Giá Checkpoint (Health Status)
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-400">
                  Sau buổi tư vấn, gửi đánh giá sức khỏe tiến độ của Đội thi (Green: Tốt, Yellow: Chậm, Red: Báo động/bỏ cuộc).
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="mentor-feedback-booking" className="block text-xs font-semibold uppercase text-slate-500">
                      Chọn Lịch Hẹn / Đội Thi
                    </label>
                    <select
                      id="mentor-feedback-booking"
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                      value={selectedBookingId}
                      onChange={(e) => setSelectedBookingId(e.target.value)}
                    >
                      {bookings.length === 0 ? (
                        <option value="">Chưa có lịch hẹn nào</option>
                      ) : (
                        bookings.map((b) => (
                          <option key={b.bookingId} value={b.bookingId}>
                            {b.teamName} - {b.objective} ({formatDate(b.startTime)})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase text-slate-500">
                      Đánh giá Trạng thái Sức khỏe Tiến độ (Health Status)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setHealthStatus('Green')}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                          healthStatus === 'Green' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Green (Tốt)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHealthStatus('Yellow')}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                          healthStatus === 'Yellow' ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-600" /> Yellow (Chậm)
                      </button>
                      <button
                        type="button"
                        onClick={() => setHealthStatus('Red')}
                        className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                          healthStatus === 'Red' ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600'
                        }`}
                      >
                        <XCircle className="h-4 w-4 text-rose-600" /> Red (Báo động)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="mentor-feedback-text" className="block text-xs font-semibold uppercase text-slate-500">
                      Nội dung Nhận xét / Góp ý Chi tiết
                    </label>
                    <textarea
                      id="mentor-feedback-text"
                      rows={4}
                      placeholder="Ví dụ: Team cần cải thiện UI và tối ưu lại API..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="h-10 rounded-xl bg-indigo-600 px-5 text-xs font-bold text-white hover:bg-indigo-700"
                      disabled={submittingFeedback || bookings.length === 0}
                    >
                      <Send className="mr-2 h-3.5 w-3.5" />
                      {submittingFeedback ? 'Đang gửi...' : 'Gửi Feedback Checkpoint'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tab: Teams */}
          {activeTab === 'teams' && (
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-base font-bold">Đội thi phụ trách</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                {teams.map((t) => (
                  <div key={t.TeamId} className="p-3 border rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-bold">{t.TeamName}</p>
                      <p className="text-xs text-slate-500">{t.CategoryName}</p>
                    </div>
                    <Badge>{t.TeamStatus}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function MentorPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      }
    >
      <MentorDashboardContent />
    </Suspense>
  );
}
