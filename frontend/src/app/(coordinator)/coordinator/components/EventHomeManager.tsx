'use client';

import React, { useState } from 'react';
import { CalendarPlus, Globe2, Star, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  createEventApi,
  featureEventApi,
  publishEventApi,
  unfeatureEventApi,
  unpublishEventApi,
  deleteEventApi,
} from '@/services/api/competition';
import type { CoordinatorEvent } from './types';
import { formatDate, getApiErrorMessage, toDateInputValue } from './helpers';

interface EventHomeManagerProps {
  events: CoordinatorEvent[];
  onEventCreated: (event: CoordinatorEvent) => void;
  onEventUpdated: (event: CoordinatorEvent) => void;
  onEventDeleted: (eventId: string) => void;
}

const createInitialForm = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 30);

  return {
    EventName: '',
    Season: 'Spring',
    Year: start.getFullYear(),
    Description: '',
    StartDate: toDateInputValue(start),
    EndDate: toDateInputValue(end),
    BannerUrl: '',
    Organizer: 'SEAL Hackathon',
    Format: 'Online' as const,
    Audience: 'Sinh viên',
    Prize: '',
  };
};

export default function EventHomeManager({
  events,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
}: EventHomeManagerProps) {
  const [form, setForm] = useState(createInitialForm);
  const [creating, setCreating] = useState(false);
  const [eventActionId, setEventActionId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const updateForm = (field: keyof typeof form, value: string | number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setMessage('');
    setError('');

    try {
      const createdEvent = await createEventApi({
        ...form,
        Year: Number(form.Year),
        StartDate: new Date(form.StartDate).toISOString(),
        EndDate: new Date(form.EndDate).toISOString(),
      });
      onEventCreated(createdEvent);
      setForm(createInitialForm());
      setMessage('Đã tạo Event mới ở trạng thái Draft. Bạn có thể Publish để đưa lên Home page.');
    } catch (createError: unknown) {
      console.error(createError);
      setError(getApiErrorMessage(createError, 'Không thể tạo Event mới.'));
    } finally {
      setCreating(false);
    }
  };

  const handleEventHomeAction = async (
    eventId: string,
    action: 'publish' | 'unpublish' | 'feature' | 'unfeature'
  ) => {
    setEventActionId(eventId);
    setMessage('');
    setError('');

    try {
      const updatedEvent =
        action === 'publish'
          ? await publishEventApi(eventId)
          : action === 'unpublish'
            ? await unpublishEventApi(eventId)
            : action === 'feature'
              ? await featureEventApi(eventId)
              : await unfeatureEventApi(eventId);

      onEventUpdated(updatedEvent);
      setMessage('Đã cập nhật trạng thái hiển thị Home page cho Event.');
    } catch (actionError: unknown) {
      console.error(actionError);
      setError(getApiErrorMessage(actionError, 'Không thể cập nhật trạng thái hiển thị Event.'));
    } finally {
      setEventActionId('');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) return;

    setEventActionId(eventId);
    setMessage('');
    setError('');

    try {
      await deleteEventApi(eventId);
      onEventDeleted(eventId);
      setMessage('Đã xóa sự kiện thành công.');
    } catch (deleteError: unknown) {
      console.error(deleteError);
      setError(getApiErrorMessage(deleteError, 'Không thể xóa sự kiện.'));
    } finally {
      setEventActionId('');
    }
  };

  return (
    <Card className="bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Globe2 className="w-5 h-5" /> Event & Home page
        </CardTitle>
        <CardDescription className="text-xs text-slate-400 font-medium">
          Tạo Event mới, Publish hoặc ghim Event nổi bật trên trang chủ công khai.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <CalendarPlus className="w-4 h-4" /> Tạo Event mới
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="event-name" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Tên Event
              </label>
              <Input
                id="event-name"
                value={form.EventName}
                onChange={(event) => updateForm('EventName', event.target.value)}
                placeholder="SEAL Spring Hackathon 2026"
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-season" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Mùa
              </label>
              <Input
                id="event-season"
                value={form.Season}
                onChange={(event) => updateForm('Season', event.target.value)}
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-year" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Năm
              </label>
              <Input
                id="event-year"
                type="number"
                value={form.Year}
                onChange={(event) => updateForm('Year', Number(event.target.value))}
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                min={2000}
                max={2100}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-start" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Ngày bắt đầu
              </label>
              <Input
                id="event-start"
                type="date"
                value={form.StartDate}
                onChange={(event) => updateForm('StartDate', event.target.value)}
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-end" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Ngày kết thúc
              </label>
              <Input
                id="event-end"
                type="date"
                value={form.EndDate}
                onChange={(event) => updateForm('EndDate', event.target.value)}
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-format" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Hình thức
              </label>
              <select
                id="event-format"
                value={form.Format}
                onChange={(event) => updateForm('Format', event.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none dark:bg-slate-800 dark:border-slate-700"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-audience" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Đối tượng
              </label>
              <Input
                id="event-audience"
                value={form.Audience}
                onChange={(event) => updateForm('Audience', event.target.value)}
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-organizer" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Đơn vị tổ chức
              </label>
              <Input
                id="event-organizer"
                value={form.Organizer}
                onChange={(event) => updateForm('Organizer', event.target.value)}
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-prize" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Giải thưởng
              </label>
              <Input
                id="event-prize"
                value={form.Prize}
                onChange={(event) => updateForm('Prize', event.target.value)}
                placeholder="50.000.000 VND"
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="event-banner" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Banner URL
              </label>
              <Input
                id="event-banner"
                value={form.BannerUrl}
                onChange={(event) => updateForm('BannerUrl', event.target.value)}
                placeholder="https://..."
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="event-description" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Mô tả
              </label>
              <textarea
                id="event-description"
                rows={3}
                value={form.Description}
                onChange={(event) => updateForm('Description', event.target.value)}
                placeholder="Mô tả ngắn về nội dung và mục tiêu của Event."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none dark:bg-slate-800 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 font-bold px-5 text-xs"
              disabled={creating}
            >
              {creating ? 'Đang tạo...' : 'Tạo Event'}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Danh sách Event
          </div>

          {events.length === 0 ? (
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium dark:border-slate-800 dark:bg-slate-950">
              Chưa có Event để hiển thị.
            </div>
          ) : (
            events.map((event) => (
              <div key={event.EventId} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {event.EventName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      {formatDate(event.StartDate)} - {formatDate(event.EndDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {event.IsFeatured && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                    <Badge className={`text-[9px] font-extrabold border ${
                      event.IsPublished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {event.IsPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {event.IsPublished ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-8 rounded-lg text-[10px] font-bold"
                      disabled={eventActionId === event.EventId}
                      onClick={() => void handleEventHomeAction(event.EventId, 'unpublish')}
                    >
                      Gỡ Home
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="h-8 rounded-lg text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                      disabled={eventActionId === event.EventId}
                      onClick={() => void handleEventHomeAction(event.EventId, 'publish')}
                    >
                      Publish
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg text-[10px] font-bold"
                    disabled={eventActionId === event.EventId || !event.IsPublished}
                    onClick={() => void handleEventHomeAction(event.EventId, event.IsFeatured ? 'unfeature' : 'feature')}
                  >
                    {event.IsFeatured ? 'Bỏ ghim' : 'Ghim'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg text-[10px] font-bold border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:hover:bg-rose-950/20 dark:text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
                    disabled={eventActionId === event.EventId}
                    onClick={() => void handleDeleteEvent(event.EventId)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
