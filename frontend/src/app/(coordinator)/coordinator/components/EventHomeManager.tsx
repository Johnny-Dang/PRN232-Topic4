'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, ChevronDown, ChevronUp, CirclePlus, Globe2, ImageUp, Pencil, Star, Trash2 } from 'lucide-react';
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
  addRoundForEventApi,
  deleteRoundApi,
  updateRoundApi,
  uploadEventBannerApi,
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
} from '@/services/api/competition';
import type { Category } from '@/services/types/competition';
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

const createInitialRoundForm = (event: CoordinatorEvent) => ({
  RoundName: '',
  RoundOrder: event.Rounds.length + 1,
  StartDate: toDateInputValue(new Date(event.StartDate)),
  EndDate: toDateInputValue(new Date(event.EndDate)),
  SubmissionDeadline: toDateInputValue(new Date(event.EndDate)),
});

const createRoundFormFromRound = (round: CoordinatorEvent['Rounds'][number]) => ({
  RoundName: round.RoundName,
  RoundOrder: round.RoundOrder,
  StartDate: toDateInputValue(new Date(round.StartDate)),
  EndDate: toDateInputValue(new Date(round.EndDate)),
  SubmissionDeadline: toDateInputValue(new Date(round.SubmissionDeadline)),
});

const createInitialCategoryForm = (eventId: string) => ({
  EventId: eventId,
  CategoryName: '',
  Description: '',
});

const EVENTS_PER_PAGE = 2;

export default function EventHomeManager({
  events,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
}: EventHomeManagerProps) {
  const [form, setForm] = useState(createInitialForm);
  const [creating, setCreating] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [eventActionId, setEventActionId] = useState<string>('');
  const [roundEventId, setRoundEventId] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string>('');
  const [roundForm, setRoundForm] = useState<ReturnType<typeof createInitialRoundForm> | null>(null);
  const [creatingRound, setCreatingRound] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<string>('');
  const [roundFormError, setRoundFormError] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryEventId, setCategoryEventId] = useState<string>('');
  const [categoryForm, setCategoryForm] = useState<ReturnType<typeof createInitialCategoryForm> | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string>('');
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [eventPage, setEventPage] = useState(1);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    void getCategoriesApi()
      .then(setCategories)
      .catch((loadError: unknown) => {
        console.error(loadError);
        setError('Không thể tải danh sách Category.');
      });
  }, []);

  const filteredEvents = useMemo(() => {
    const search = eventSearch.trim().toLocaleLowerCase();
    return events.filter((event) => {
      const matchesSearch = !search || event.EventName.toLocaleLowerCase().includes(search);
      const matchesStatus = eventStatusFilter === 'all'
        || (eventStatusFilter === 'published' && event.IsPublished)
        || (eventStatusFilter === 'draft' && !event.IsPublished);
      return matchesSearch && matchesStatus;
    });
  }, [events, eventSearch, eventStatusFilter]);
  const eventTotalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));
  const safeEventPage = Math.min(eventPage, eventTotalPages);
  const pagedEvents = filteredEvents.slice((safeEventPage - 1) * EVENTS_PER_PAGE, safeEventPage * EVENTS_PER_PAGE);

  const updateForm = (field: keyof typeof form, value: string | number) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingBanner(true);
    setError('');
    setMessage('');
    try {
      const bannerUrl = await uploadEventBannerApi(file);
      updateForm('BannerUrl', bannerUrl);
      setMessage('Đã upload ảnh banner lên Cloudinary.');
    } catch (uploadError: unknown) {
      console.error(uploadError);
      setError(getApiErrorMessage(uploadError, 'Không thể upload ảnh banner.'));
    } finally {
      setUploadingBanner(false);
    }
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

  const toggleCategoryForm = (event: CoordinatorEvent) => {
    if (categoryEventId === event.EventId) {
      setCategoryEventId('');
      setCategoryForm(null);
      setEditingCategoryId('');
      setCategoryError('');
      return;
    }

    setExpandedEventId(event.EventId);
    setCategoryEventId(event.EventId);
    setCategoryForm(createInitialCategoryForm(event.EventId));
    setEditingCategoryId('');
    setCategoryError('');
  };

  const handleEditCategory = (category: Category) => {
    setCategoryEventId(category.EventId);
    setCategoryForm({
      EventId: category.EventId,
      CategoryName: category.CategoryName,
      Description: category.Description,
    });
    setEditingCategoryId(category.CategoryId);
    setCategoryError('');
  };

  const handleSaveCategory = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    if (!categoryForm) return;

    setSavingCategory(true);
    setCategoryError('');
    setMessage('');
    try {
      const savedCategory = editingCategoryId
        ? await updateCategoryApi(editingCategoryId, categoryForm)
        : await createCategoryApi(categoryForm);

      setCategories((current) => editingCategoryId
        ? current.map((item) => item.CategoryId === savedCategory.CategoryId ? savedCategory : item)
        : [...current, savedCategory]);
      setMessage(editingCategoryId ? 'Đã cập nhật Category.' : 'Đã thêm Category cho Event.');
      setCategoryEventId('');
      setCategoryForm(null);
      setEditingCategoryId('');
    } catch (saveError: unknown) {
      console.error(saveError);
      setCategoryError(getApiErrorMessage(saveError, 'Không thể lưu Category.'));
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`Bạn có chắc muốn xóa Category "${category.CategoryName}"?`)) return;

    setSavingCategory(true);
    setError('');
    setMessage('');
    try {
      await deleteCategoryApi(category.CategoryId);
      setCategories((current) => current.filter((item) => item.CategoryId !== category.CategoryId));
      setMessage('Đã xóa Category.');
      if (editingCategoryId === category.CategoryId) {
        setCategoryEventId('');
        setCategoryForm(null);
        setEditingCategoryId('');
      }
    } catch (deleteError: unknown) {
      console.error(deleteError);
      setError(getApiErrorMessage(deleteError, 'Không thể xóa Category.'));
    } finally {
      setSavingCategory(false);
    }
  };

  const toggleRoundForm = (event: CoordinatorEvent) => {
    if (roundEventId === event.EventId) {
      setRoundEventId('');
      setRoundForm(null);
      setEditingRoundId('');
      return;
    }

    setExpandedEventId(event.EventId);
    setRoundEventId(event.EventId);
    setRoundForm(createInitialRoundForm(event));
    setEditingRoundId('');
    setRoundFormError('');
    setError('');
    setMessage('');
  };

  const updateRoundForm = (field: keyof NonNullable<typeof roundForm>, value: string | number) => {
    setRoundForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleEditRound = (event: CoordinatorEvent, round: CoordinatorEvent['Rounds'][number]) => {
    setRoundEventId(event.EventId);
    setRoundForm(createRoundFormFromRound(round));
    setEditingRoundId(round.RoundId);
    setRoundFormError('');
    setError('');
    setMessage('');
  };

  const handleCreateRound = async (event: React.FormEvent, coordinatorEvent: CoordinatorEvent) => {
    event.preventDefault();
    if (!roundForm) return;

    const eventStart = toDateInputValue(new Date(coordinatorEvent.StartDate));
    const eventEnd = toDateInputValue(new Date(coordinatorEvent.EndDate));

    if (!roundForm.RoundName.trim()) {
      setRoundFormError('Vui lòng nhập tên vòng thi.');
      return;
    }
    if (!Number.isInteger(Number(roundForm.RoundOrder)) || Number(roundForm.RoundOrder) < 1) {
      setRoundFormError('Thứ tự vòng phải là số nguyên lớn hơn hoặc bằng 1.');
      return;
    }
    if (roundForm.StartDate >= roundForm.EndDate) {
      setRoundFormError('Ngày bắt đầu vòng phải sớm hơn ngày kết thúc vòng.');
      return;
    }
    if (roundForm.SubmissionDeadline < roundForm.StartDate || roundForm.SubmissionDeadline > roundForm.EndDate) {
      setRoundFormError('Hạn cuối nộp bài phải nằm trong thời gian diễn ra vòng thi.');
      return;
    }
    if (roundForm.StartDate < eventStart || roundForm.EndDate > eventEnd) {
      setRoundFormError(`Thời gian vòng thi phải nằm trong thời gian event (${eventStart} đến ${eventEnd}).`);
      return;
    }
    if (coordinatorEvent.Rounds.some((round) => round.RoundId !== editingRoundId && round.RoundOrder === Number(roundForm.RoundOrder))) {
      setRoundFormError(`Event này đã có vòng thứ ${roundForm.RoundOrder}. Vui lòng chọn thứ tự khác.`);
      return;
    }

    setCreatingRound(true);
    setError('');
    setMessage('');
    setRoundFormError('');

    try {
      const request = {
        ...roundForm,
        RoundOrder: Number(roundForm.RoundOrder),
        StartDate: new Date(roundForm.StartDate).toISOString(),
        EndDate: new Date(roundForm.EndDate).toISOString(),
        SubmissionDeadline: new Date(roundForm.SubmissionDeadline).toISOString(),
      };
      if (editingRoundId) {
        const updatedRound = await updateRoundApi(editingRoundId, request);
        onEventUpdated({
          ...coordinatorEvent,
          Rounds: coordinatorEvent.Rounds.map((round) => round.RoundId === editingRoundId ? updatedRound : round),
        });
      } else {
        const updatedEvent = await addRoundForEventApi(coordinatorEvent.EventId, request);
        onEventUpdated(updatedEvent);
      }
      setRoundEventId('');
      setRoundForm(null);
      setEditingRoundId('');
      setMessage(editingRoundId ? 'Đã cập nhật thông tin vòng thi.' : `Đã thêm vòng thi cho event “${coordinatorEvent.EventName}”.`);
    } catch (roundError: unknown) {
      console.error(roundError);
      setRoundFormError(getApiErrorMessage(roundError, 'Không thể tạo vòng thi. Vui lòng kiểm tra lại thông tin event và vòng thi.'));
    } finally {
      setCreatingRound(false);
    }
  };

  const handleDeleteRound = async (coordinatorEvent: CoordinatorEvent, roundId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vòng thi này?')) return;

    setCreatingRound(true);
    setError('');
    setMessage('');
    try {
      await deleteRoundApi(roundId);
      onEventUpdated({
        ...coordinatorEvent,
        Rounds: coordinatorEvent.Rounds.filter((round) => round.RoundId !== roundId),
      });
      if (editingRoundId === roundId) {
        setRoundEventId('');
        setRoundForm(null);
        setEditingRoundId('');
      }
      setMessage('Đã xóa vòng thi.');
    } catch (deleteError: unknown) {
      console.error(deleteError);
      setError(getApiErrorMessage(deleteError, 'Không thể xóa vòng thi.'));
    } finally {
      setCreatingRound(false);
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
                aria-label="Chọn hình thức tổ chức sự kiện"
                title="Chọn hình thức tổ chức sự kiện"
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
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="event-banner"
                  value={form.BannerUrl}
                  onChange={(event) => updateForm('BannerUrl', event.target.value)}
                  placeholder="https://..."
                  className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
                <label htmlFor="event-banner-file" className={`inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white ${uploadingBanner ? 'cursor-wait bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                  <ImageUp className="h-4 w-4" />
                  {uploadingBanner ? 'Đang upload...' : 'Chọn ảnh'}
                </label>
                <input id="event-banner-file" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploadingBanner} onChange={(event) => void handleBannerUpload(event)} />
              </div>
              <p className="text-[10px] text-slate-400">Chọn ảnh JPG, PNG hoặc WebP (tối đa 5 MB); ảnh sẽ được upload lên Cloudinary và URL được điền tự động.</p>
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

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              value={eventSearch}
              onChange={(event) => { setEventSearch(event.target.value); setEventPage(1); }}
              placeholder="Tìm theo tên Event..."
              className="h-9 rounded-xl text-xs"
            />
            <select
              value={eventStatusFilter}
              onChange={(event) => { setEventStatusFilter(event.target.value as 'all' | 'published' | 'draft'); setEventPage(1); }}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-500 font-medium dark:border-slate-800 dark:bg-slate-950">
              Không có Event phù hợp với bộ lọc.
            </div>
          ) : (
            pagedEvents.map((event) => (
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

                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg text-[10px] font-bold"
                    onClick={() => setExpandedEventId((current) => current === event.EventId ? '' : event.EventId)}
                  >
                    Chi tiết
                    {expandedEventId === event.EventId ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg text-[10px] font-bold"
                    disabled={creatingRound && roundEventId === event.EventId}
                    onClick={() => toggleRoundForm(event)}
                  >
                    <CirclePlus className="w-3.5 h-3.5 mr-1" />
                    Vòng thi
                    {roundEventId === event.EventId ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-lg text-[10px] font-bold"
                    disabled={savingCategory && categoryEventId === event.EventId}
                    onClick={() => toggleCategoryForm(event)}
                  >
                    <CirclePlus className="mr-1 h-3.5 w-3.5" />
                    Category
                    {categoryEventId === event.EventId ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                  </Button>
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

                {expandedEventId === event.EventId && (
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3 dark:border-slate-800 dark:bg-slate-950/30">
                    <div className="grid gap-2 text-[10px] text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                      <span><strong className="text-slate-700 dark:text-slate-200">Mùa/Năm:</strong> {event.Season} {event.Year}</span>
                      <span><strong className="text-slate-700 dark:text-slate-200">Hình thức:</strong> {event.Format}</span>
                      <span><strong className="text-slate-700 dark:text-slate-200">Đối tượng:</strong> {event.Audience || 'Chưa cập nhật'}</span>
                      <span><strong className="text-slate-700 dark:text-slate-200">Giải thưởng:</strong> {event.Prize || 'Chưa cập nhật'}</span>
                      <span className="sm:col-span-2"><strong className="text-slate-700 dark:text-slate-200">Đơn vị tổ chức:</strong> {event.Organizer || 'Chưa cập nhật'}</span>
                      <span className="sm:col-span-2"><strong className="text-slate-700 dark:text-slate-200">Mô tả:</strong> {event.Description || 'Chưa cập nhật'}</span>
                    </div>
                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
                  <div className="text-[10px] font-bold text-slate-500">Category thi đấu</div>
                  {categories.filter((category) => category.EventId === event.EventId).length === 0 ? (
                    <p className="text-[10px] text-slate-400">Chưa có Category. Thêm ít nhất một Category để đội có thể đăng ký Event.</p>
                  ) : (
                    <div className="space-y-2">
                      {categories.filter((category) => category.EventId === event.EventId).map((category) => (
                        <div key={category.CategoryId} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-950/50">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{category.CategoryName}</div>
                            {category.Description && <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{category.Description}</p>}
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[10px]" disabled={savingCategory} onClick={() => handleEditCategory(category)}>
                              <Pencil className="mr-1 h-3 w-3" /> Sửa
                            </Button>
                            <Button type="button" variant="outline" className="h-7 rounded-md border-rose-200 px-2 text-[10px] text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400" disabled={savingCategory} onClick={() => void handleDeleteCategory(category)}>
                              <Trash2 className="mr-1 h-3 w-3" /> Xóa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {categoryEventId === event.EventId && categoryForm && (
                  <form onSubmit={(submitEvent) => void handleSaveCategory(submitEvent)} className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      {editingCategoryId ? 'Chỉnh sửa Category của' : 'Thêm Category cho'} {event.EventName}
                    </div>
                    {categoryError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{categoryError}</div>}
                    <div className="space-y-1.5">
                      <label htmlFor={`category-name-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Tên Category</label>
                      <Input id={`category-name-${event.EventId}`} required minLength={2} maxLength={150} value={categoryForm.CategoryName} onChange={(inputEvent) => setCategoryForm((current) => current ? { ...current, CategoryName: inputEvent.target.value } : current)} placeholder="Ví dụ: Web Application" className="h-9 rounded-lg text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`category-description-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Mô tả</label>
                      <textarea id={`category-description-${event.EventId}`} rows={2} maxLength={2000} value={categoryForm.Description} onChange={(inputEvent) => setCategoryForm((current) => current ? { ...current, Description: inputEvent.target.value } : current)} placeholder="Mô tả ngắn về hạng mục thi đấu." className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-900" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" className="h-8 rounded-lg text-[10px]" onClick={() => toggleCategoryForm(event)}>Hủy</Button>
                      <Button type="submit" disabled={savingCategory} className="h-8 rounded-lg bg-indigo-600 text-[10px] hover:bg-indigo-700">{savingCategory ? 'Đang lưu...' : editingCategoryId ? 'Lưu thay đổi' : 'Tạo Category'}</Button>
                    </div>
                  </form>
                )}

                {event.Rounds.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500">Các vòng thi đã tạo</div>
                    {[...event.Rounds].sort((a, b) => a.RoundOrder - b.RoundOrder).map((round) => (
                      <div key={round.RoundId} className="rounded-xl border border-slate-200 bg-white p-3 text-[10px] shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 dark:text-slate-100">Vòng {round.RoundOrder}: {round.RoundName}</div>
                            <div className="mt-1 text-slate-500 dark:text-slate-400">Diễn ra: {formatDate(round.StartDate)} – {formatDate(round.EndDate)}</div>
                            <div className="mt-1 text-slate-500 dark:text-slate-400">Hạn nộp bài: <strong className="text-slate-700 dark:text-slate-200">{formatDate(round.SubmissionDeadline)}</strong></div>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[10px]" disabled={creatingRound} onClick={() => handleEditRound(event, round)}>
                              <Pencil className="mr-1 h-3 w-3" /> Sửa
                            </Button>
                            <Button type="button" variant="outline" className="h-7 rounded-md border-rose-200 px-2 text-[10px] text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400" disabled={creatingRound} onClick={() => void handleDeleteRound(event, round.RoundId)}>
                              <Trash2 className="mr-1 h-3 w-3" /> Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {event.Rounds.length > 0 && false && (
                  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] dark:border-slate-700 dark:bg-slate-900">
                    <div className="mb-1 font-bold text-slate-500">Vòng thi đã tạo</div>
                    <div className="space-y-1">
                      {[...event.Rounds].sort((a, b) => a.RoundOrder - b.RoundOrder).map((round) => (
                        <div key={round.RoundId} className="flex justify-between gap-2 text-slate-600 dark:text-slate-300">
                          <span>Vòng {round.RoundOrder}: {round.RoundName}</span>
                          <span className="shrink-0">Hạn nộp: {formatDate(round.SubmissionDeadline)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {roundEventId === event.EventId && roundForm && (
                  <form onSubmit={(submitEvent) => void handleCreateRound(submitEvent, event)} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                    <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      {editingRoundId ? 'Chỉnh sửa vòng thi của' : 'Thêm vòng thi cho'} {event.EventName}
                    </div>
                    {roundFormError && (
                      <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
                        {roundFormError}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5 md:col-span-2">
                        <label htmlFor={`round-name-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Tên vòng thi
                        </label>
                        <Input id={`round-name-${event.EventId}`} required value={roundForm.RoundName} onChange={(inputEvent) => updateRoundForm('RoundName', inputEvent.target.value)} placeholder="Ví dụ: Vòng loại 1 - Thực hiện phát thảo ý tưởng" className="h-9 rounded-lg text-xs" />
                        <p className="text-[10px] text-slate-400">Tên giúp phân biệt mục tiêu và nội dung của từng vòng.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor={`round-order-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Thứ tự vòng
                        </label>
                        <Input id={`round-order-${event.EventId}`} required type="number" min={1} max={100} value={roundForm.RoundOrder} onChange={(inputEvent) => updateRoundForm('RoundOrder', Number(inputEvent.target.value))} placeholder="Ví dụ: 1" className="h-9 rounded-lg text-xs" />
                        <p className="text-[10px] text-slate-400">Số nhỏ hơn sẽ diễn ra trước.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor={`round-deadline-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Hạn cuối nộp bài
                        </label>
                        <Input id={`round-deadline-${event.EventId}`} required type="date" min={roundForm.StartDate || toDateInputValue(new Date(event.StartDate))} max={roundForm.EndDate || toDateInputValue(new Date(event.EndDate))} value={roundForm.SubmissionDeadline} onChange={(inputEvent) => updateRoundForm('SubmissionDeadline', inputEvent.target.value)} className="h-9 rounded-lg text-xs" />
                        <p className="text-[10px] text-slate-400">Đội thi không thể nộp bài sau ngày này.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor={`round-start-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Ngày bắt đầu vòng
                        </label>
                        <Input id={`round-start-${event.EventId}`} required type="date" min={toDateInputValue(new Date(event.StartDate))} max={toDateInputValue(new Date(event.EndDate))} value={roundForm.StartDate} onChange={(inputEvent) => updateRoundForm('StartDate', inputEvent.target.value)} className="h-9 rounded-lg text-xs" />
                        <p className="text-[10px] text-slate-400">Ngày mở vòng thi cho các đội tham gia.</p>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor={`round-end-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Ngày kết thúc vòng
                        </label>
                        <Input id={`round-end-${event.EventId}`} required type="date" min={roundForm.StartDate || toDateInputValue(new Date(event.StartDate))} max={toDateInputValue(new Date(event.EndDate))} value={roundForm.EndDate} onChange={(inputEvent) => updateRoundForm('EndDate', inputEvent.target.value)} className="h-9 rounded-lg text-xs" />
                        <p className="text-[10px] text-slate-400">Ngày đóng vòng và chuyển sang vòng kế tiếp.</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" className="h-8 rounded-lg text-[10px]" onClick={() => toggleRoundForm(event)}>Hủy</Button>
                      <Button type="submit" disabled={creatingRound} className="h-8 rounded-lg bg-indigo-600 text-[10px] hover:bg-indigo-700">
                        {creatingRound ? 'Đang lưu...' : editingRoundId ? 'Lưu thay đổi' : 'Tạo vòng thi'}
                      </Button>
                    </div>
                  </form>
                )}
                  </div>
                )}
              </div>
            ))
          )}
          {filteredEvents.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500 dark:border-slate-800">
              <span>Trang {safeEventPage}/{eventTotalPages} · {filteredEvents.length} Event</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="h-7 rounded-lg px-2 text-[10px]" disabled={safeEventPage === 1} onClick={() => setEventPage((current) => Math.max(1, current - 1))}>Trước</Button>
                <Button type="button" variant="outline" className="h-7 rounded-lg px-2 text-[10px]" disabled={safeEventPage === eventTotalPages} onClick={() => setEventPage((current) => Math.min(eventTotalPages, current + 1))}>Sau</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
