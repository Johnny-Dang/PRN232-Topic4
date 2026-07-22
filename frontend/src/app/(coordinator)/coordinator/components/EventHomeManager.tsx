'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, ChevronDown, ChevronUp, CirclePlus, Globe2, ImageUp, Pencil, Star, Trash2, Plus, X, Layers, Check, Calendar } from 'lucide-react';
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
  createCategoryApi,
  deleteCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
  updateEventApi,
  getEventByIdApi,
  type UpdateEventRequest,
} from '@/services/api/competition';
import { getTeams, type Team } from '@/lib/api';
import type { Category } from '@/services/types/competition';
import type { CoordinatorEvent } from './types';
import { formatDate, getApiErrorMessage, toDateInputValue } from './helpers';

interface EventHomeManagerProps {
  events: CoordinatorEvent[];
  onEventCreated: (event: CoordinatorEvent) => void;
  onEventUpdated: (event: CoordinatorEvent) => void;
  onEventDeleted: (eventId: string) => void;
}

export interface FormCategoryItem {
  id: string;
  CategoryName: string;
  Description: string;
}

export interface FormRoundItem {
  id: string;
  RoundName: string;
  RoundOrder: number;
  StartDate: string;
  EndDate: string;
  SubmissionDeadline: string;
}

const createInitialForm = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + 7);

  const end = new Date(start);
  end.setDate(end.getDate() + 30);

  const round1End = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);

  return {
    EventName: '',
    Season: 'Spring',
    Year: start.getFullYear(),
    Description: '',
    StartDate: toDateInputValue(start),
    EndDate: toDateInputValue(end),
    BannerImage: null as File | null,
    Organizer: 'SEAL Hackathon',
    Format: 'Online' as const,
    Audience: 'Sinh viên',
    Prize: '',
    initialCategories: [] as FormCategoryItem[],
    initialRounds: [] as FormRoundItem[],
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

const DEFAULT_CATEGORIES = [
  { name: 'Phát triển Phần mềm', description: 'Các dự án ứng dụng và hệ thống phần mềm' },
  { name: 'Trí tuệ nhân tạo (AI)', description: 'Các dự án AI, Machine Learning và Deep Learning' },
  { name: 'Internet of Things (IoT)', description: 'Các dự án kết nối thiết bị thông minh và phần cứng' },
  { name: 'Phát triển Game', description: 'Các dự án thiết kế và lập trình trò chơi' },
  { name: 'An toàn thông tin', description: 'Các dự án bảo mật, kiểm thử và an ninh mạng' },
  { name: 'Điện toán đám mây', description: 'Các giải pháp hạ tầng và ứng dụng Cloud' },
  { name: 'Công nghệ Blockchain', description: 'Các dự án phân tán, hợp đồng thông minh và Web3' }
];

const createInitialCategoryForm = (eventId: string) => ({
  EventId: eventId,
  CategoryName: '',
  Description: '',
});

const EVENTS_PER_PAGE = 2;
type EventContentSection = 'details' | 'categories' | 'rounds' | '';

export default function EventHomeManager({
  events,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
}: EventHomeManagerProps) {
  const [form, setForm] = useState(createInitialForm);
  const [creating, setCreating] = useState(false);
  const [eventActionId, setEventActionId] = useState<string>('');
  const [roundEventId, setRoundEventId] = useState<string>('');
  const [expandedEventId, setExpandedEventId] = useState<string>('');
  const [expandedSection, setExpandedSection] = useState<EventContentSection>('');
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

  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventForm, setEditEventForm] = useState<UpdateEventRequest | null>(null);
  const [savingEvent, setSavingEvent] = useState(false);
  const [editEventError, setEditEventError] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    void getCategoriesApi()
      .then(setCategories)
      .catch((loadError: unknown) => {
        console.error(loadError);
        setError('Không thể tải danh sách Category.');
      });

    getTeams().then(setTeams).catch(console.error);
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

  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    const list: { name: string; description: string }[] = [];
    categories.forEach((c) => {
      const normalized = c.CategoryName.trim();
      if (normalized && !seen.has(normalized.toLowerCase())) {
        seen.add(normalized.toLowerCase());
        list.push({ name: normalized, description: c.Description });
      }
    });

    if (list.length === 0) {
      DEFAULT_CATEGORIES.forEach((dc) => {
        list.push(dc);
      });
    }
    return list;
  }, [categories]);

  const updateForm = (field: keyof typeof form, value: string | number | File | null) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleStartDateChange = (value: string) => {
    const year = value ? new Date(value).getFullYear() : form.Year;
    setForm((current) => ({
      ...current,
      StartDate: value,
      Year: year,
    }));
  };

  const getRegisteredTeamsCount = (eventId: string) => {
    return teams.filter((t) => t.EventID === eventId).length;
  };

  const hasRegisteredTeams = (eventId: string) => getRegisteredTeamsCount(eventId) > 0;

  const startEditEvent = (event: CoordinatorEvent) => {
    setEditingEventId(event.EventId);
    setEditEventForm({
      EventId: event.EventId,
      EventName: event.EventName,
      Season: event.Season,
      Year: event.Year,
      Description: event.Description,
      StartDate: toDateInputValue(new Date(event.StartDate)),
      EndDate: toDateInputValue(new Date(event.EndDate)),
      BannerUrl: event.BannerUrl,
      Organizer: event.Organizer,
      Format: event.Format,
      Audience: event.Audience,
      Prize: event.Prize,
    });
    setEditEventError('');
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId || !editEventForm) return;
    setSavingEvent(true);
    setEditEventError('');
    try {
      const updated = await updateEventApi(editingEventId, {
        EventId: editingEventId,
        EventName: editEventForm.EventName,
        Season: editEventForm.Season,
        Year: Number(editEventForm.Year),
        Description: editEventForm.Description,
        StartDate: new Date(editEventForm.StartDate).toISOString(),
        EndDate: new Date(editEventForm.EndDate).toISOString(),
        BannerUrl: editEventForm.BannerUrl || '',
        Organizer: editEventForm.Organizer || '',
        Format: editEventForm.Format || 'Online',
        Audience: editEventForm.Audience || 'Sinh viên',
        Prize: editEventForm.Prize || '',
      });
      onEventUpdated(updated);
      setEditingEventId(null);
      setEditEventForm(null);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setEditEventError(axiosError.response?.data?.message || 'Không thể cập nhật Event.');
    } finally {
      setSavingEvent(false);
    }
  };

  const toggleSelectCategory = (categoryName: string, description: string) => {
    setForm((prev) => {
      const exists = prev.initialCategories.some(
        (c) => c.CategoryName.toLowerCase() === categoryName.toLowerCase()
      );
      if (exists) {
        return {
          ...prev,
          initialCategories: [],
        };
      } else {
        return {
          ...prev,
          initialCategories: [
            { id: `cat-${Date.now()}-${Math.random()}`, CategoryName: categoryName, Description: description },
          ],
        };
      }
    });
  };

  const removeCategoryFromForm = (id: string) => {
    setForm((prev) => ({
      ...prev,
      initialCategories: prev.initialCategories.filter((c) => c.id !== id),
    }));
  };

  const addRoundToForm = () => {
    setForm((prev) => {
      const newOrder = prev.initialRounds.length + 1;
      const lastRound = prev.initialRounds[prev.initialRounds.length - 1];
      const startDate = lastRound ? lastRound.EndDate : prev.StartDate;
      const endDate = prev.EndDate;

      return {
        ...prev,
        initialRounds: [
          ...prev.initialRounds,
          {
            id: `round-${Date.now()}`,
            RoundName: `Vòng ${newOrder}`,
            RoundOrder: newOrder,
            StartDate: startDate,
            EndDate: endDate,
            SubmissionDeadline: endDate,
          },
        ],
      };
    });
  };

  const updateFormRound = (id: string, field: keyof FormRoundItem, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      initialRounds: prev.initialRounds.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  const removeRoundFromForm = (id: string) => {
    setForm((prev) => {
      const filtered = prev.initialRounds.filter((r) => r.id !== id);
      const reindexed = filtered.map((r, idx) => ({ ...r, RoundOrder: idx + 1 }));
      return {
        ...prev,
        initialRounds: reindexed,
      };
    });
  };

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setMessage('');
    setError('');

    if (!form.EventName.trim()) {
      setError('Vui lòng nhập Tên Event.');
      setCreating(false);
      return;
    }

    if (!form.Season.trim()) {
      setError('Vui lòng nhập Mùa giải.');
      setCreating(false);
      return;
    }

    if (!form.Description.trim()) {
      setError('Vui lòng nhập Mô tả cho Event (Mô tả là trường bắt buộc).');
      setCreating(false);
      return;
    }

    if (!form.StartDate) {
      setError('Vui lòng chọn Ngày bắt đầu Event.');
      setCreating(false);
      return;
    }

    if (!form.EndDate) {
      setError('Vui lòng chọn Ngày kết thúc Event.');
      setCreating(false);
      return;
    }

    if (new Date(form.StartDate) >= new Date(form.EndDate)) {
      setError('Ngày bắt đầu phải trước ngày kết thúc Event.');
      setCreating(false);
      return;
    }

    if (!form.BannerImage) {
      setError('Vui lòng chọn ảnh banner cho Event.');
      setCreating(false);
      return;
    }

    for (const rnd of form.initialRounds) {
      if (!rnd.RoundName.trim()) {
        setError(`Vòng thi thứ ${rnd.RoundOrder} chưa có tên. Vui lòng nhập tên cho tất cả các vòng thi.`);
        setCreating(false);
        return;
      }
      if (rnd.StartDate >= rnd.EndDate) {
        setError(`Vòng thi "${rnd.RoundName}": Ngày bắt đầu phải sớm hơn ngày kết thúc.`);
        setCreating(false);
        return;
      }
      if (rnd.SubmissionDeadline < rnd.StartDate || rnd.SubmissionDeadline > rnd.EndDate) {
        setError(`Vòng thi "${rnd.RoundName}": Hạn nộp bài phải nằm trong khoảng thời gian diễn ra vòng thi.`);
        setCreating(false);
        return;
      }
    }

    const requestData = {
      ...form,
      Year: Number(form.Year),
      StartDate: new Date(form.StartDate).toISOString(),
      EndDate: new Date(form.EndDate).toISOString(),
    };

    const formData = new FormData();
    formData.append('EventName', requestData.EventName);
    formData.append('Season', requestData.Season);
    formData.append('Year', String(requestData.Year));
    formData.append('Description', requestData.Description);
    formData.append('StartDate', requestData.StartDate);
    formData.append('EndDate', requestData.EndDate);
    formData.append('Organizer', requestData.Organizer);
    formData.append('Format', requestData.Format);
    formData.append('Audience', requestData.Audience);
    formData.append('Prize', requestData.Prize);
    if (requestData.BannerImage) {
      formData.append('BannerImage', requestData.BannerImage);
    }

    try {
      const createdEvent = await createEventApi(formData);

      // Create initial Categories
      for (const cat of form.initialCategories) {
        if (cat.CategoryName.trim()) {
          try {
            const savedCat = await createCategoryApi({
              EventId: createdEvent.EventId,
              CategoryName: cat.CategoryName.trim(),
              Description: cat.Description.trim(),
            });
            setCategories((current) => [...current, savedCat]);
          } catch (catErr) {
            console.error('Lỗi khi tạo category:', catErr);
          }
        }
      }

      // Create initial Rounds
      for (const rnd of form.initialRounds) {
        if (rnd.RoundName.trim()) {
          try {
            await addRoundForEventApi(createdEvent.EventId, {
              RoundName: rnd.RoundName.trim(),
              RoundOrder: rnd.RoundOrder,
              StartDate: new Date(rnd.StartDate).toISOString(),
              EndDate: new Date(rnd.EndDate).toISOString(),
              SubmissionDeadline: new Date(rnd.SubmissionDeadline).toISOString(),
            });
          } catch (rndErr) {
            console.error('Lỗi khi tạo vòng thi:', rndErr);
          }
        }
      }

      const fullCreatedEvent = await getEventByIdApi(createdEvent.EventId);
      onEventCreated(fullCreatedEvent);
      setForm(createInitialForm());
      setMessage('Đã tạo Event mới cùng các Hạng mục & Vòng thi thành công. Trạng thái: Draft.');
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

    if (action === 'publish') {
      const targetEvent = events.find((e) => e.EventId === eventId);
      const targetCategories = categories.filter((c) => c.EventId === eventId);
      const hasCategories = targetCategories.length > 0;
      const hasRounds = targetEvent && targetEvent.Rounds && targetEvent.Rounds.length > 0;

      if (!hasCategories || !hasRounds) {
        const missing: string[] = [];
        if (!hasCategories) missing.push('Hạng mục (Category)');
        if (!hasRounds) missing.push('Vòng thi (Round)');

        setError(`Không thể Publish: Sự kiện cần có ít nhất ${missing.join(' và ')} trước khi đưa lên Home page.`);
        setEventActionId('');
        return;
      }
    }

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

  const toggleEventDetails = (eventId: string) => {
    if (expandedEventId === eventId && expandedSection === 'details') {
      setExpandedEventId('');
      setExpandedSection('');
      return;
    }

    setExpandedEventId(eventId);
    setExpandedSection('details');
    setCategoryEventId('');
    setCategoryForm(null);
    setEditingCategoryId('');
    setRoundEventId('');
    setRoundForm(null);
    setEditingRoundId('');
  };

  const toggleEventSection = (eventId: string, section: Exclude<EventContentSection, '' | 'details'>) => {
    if (expandedEventId === eventId && expandedSection === section) {
      setExpandedEventId('');
      setExpandedSection('');
      return;
    }

    setExpandedEventId(eventId);
    setExpandedSection(section);
    setCategoryEventId('');
    setCategoryForm(null);
    setEditingCategoryId('');
    setRoundEventId('');
    setRoundForm(null);
    setEditingRoundId('');
  };

  const toggleCategoryForm = (event: CoordinatorEvent) => {
    if (categoryEventId === event.EventId && expandedSection === 'categories') {
      setCategoryEventId('');
      setCategoryForm(null);
      setEditingCategoryId('');
      setCategoryError('');
      setExpandedEventId('');
      setExpandedSection('');
      return;
    }

    setExpandedEventId(event.EventId);
    setExpandedSection('categories');
    setRoundEventId('');
    setRoundForm(null);
    setEditingRoundId('');
    setCategoryEventId(event.EventId);
    setCategoryForm(createInitialCategoryForm(event.EventId));
    setEditingCategoryId('');
    setCategoryError('');
  };

  const handleEditCategory = (category: Category) => {
    setExpandedEventId(category.EventId);
    setExpandedSection('categories');
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
    if (roundEventId === event.EventId && expandedSection === 'rounds') {
      setRoundEventId('');
      setRoundForm(null);
      setEditingRoundId('');
      setExpandedEventId('');
      setExpandedSection('');
      return;
    }

    setExpandedEventId(event.EventId);
    setExpandedSection('rounds');
    setCategoryEventId('');
    setCategoryForm(null);
    setEditingCategoryId('');
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
    setExpandedEventId(event.EventId);
    setExpandedSection('rounds');
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
    <Card className="border-0 bg-white shadow-none dark:bg-slate-900">
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
                Tên Event <span className="text-rose-500">*</span>
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
                Mùa <span className="text-rose-500">*</span>
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
                Năm <span className="text-rose-500">*</span>
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
                Ngày bắt đầu <span className="text-rose-500">*</span>
              </label>
              <Input
                id="event-start"
                type="date"
                value={form.StartDate}
                onChange={(event) => handleStartDateChange(event.target.value)}
                className="rounded-xl h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="event-end" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Ngày kết thúc <span className="text-rose-500">*</span>
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
              <label htmlFor="event-banner-image" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Banner ảnh <span className="text-rose-500">*</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row items-center">
                <label htmlFor="event-banner-image" className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700">
                  <ImageUp className="h-4 w-4" />
                  Chọn ảnh
                </label>
                <span className="text-xs text-slate-500">
                  {form.BannerImage ? form.BannerImage.name : 'Chưa chọn file'}
                </span>
              </div>
              <input
                id="event-banner-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  updateForm('BannerImage', file);
                }}
              />
              <p className="text-[10px] text-slate-400">Chọn ảnh JPG, PNG hoặc WebP (tối đa 5 MB); ảnh sẽ được gửi lên backend trong multipart/form-data.</p>
            </div>

            {/* Category (Hạng mục thi đấu) Section */}
            <div className="space-y-3 md:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Hạng mục thi đấu (Category)
                </label>
                <span className="text-[11px] text-slate-500 font-medium">
                  {form.initialCategories.length > 0 ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      Đã chọn: {form.initialCategories[0].CategoryName}
                    </span>
                  ) : (
                    <span className="text-slate-400">Chưa chọn hạng mục</span>
                  )}
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                Chọn 1 hạng mục thi đấu cho sự kiện này (mỗi sự kiện chỉ thuộc 1 hạng mục):
              </p>

              {/* Selectable Categories Grid List (Single Select) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {uniqueCategories.map((cat) => {
                  const selected = form.initialCategories.some(
                    (c) => c.CategoryName.toLowerCase() === cat.name.toLowerCase()
                  );
                  return (
                    <button
                      type="button"
                      key={cat.name}
                      onClick={() => toggleSelectCategory(cat.name, cat.description)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${selected
                          ? 'bg-indigo-50/90 border-indigo-300 text-indigo-900 shadow-sm dark:bg-indigo-950/70 dark:border-indigo-700 dark:text-indigo-200'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-300'
                        }`}
                    >
                      <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5 transition-colors ${selected
                          ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                          : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                        {selected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold truncate">{cat.name}</div>
                        {cat.description && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {cat.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rounds (Vòng thi) Section */}
            <div className="space-y-3 md:col-span-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Danh sách Vòng thi (Rounds)
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addRoundToForm}
                  className="h-8 px-3 text-xs font-semibold rounded-xl text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Vòng thi
                </Button>
              </div>

              {form.initialRounds.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  Chưa có vòng thi nào. Hãy nhấn nút Thêm Vòng thi để bắt đầu thiết lập.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.initialRounds.map((round) => (
                    <div
                      key={round.id}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                            {round.RoundOrder}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Vòng {round.RoundOrder}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRoundFromForm(round.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="Xóa vòng thi này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                        <div className="space-y-1 md:col-span-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Tên Vòng thi <span className="text-rose-500">*</span></label>
                          <Input
                            value={round.RoundName}
                            onChange={(e) => updateFormRound(round.id, 'RoundName', e.target.value)}
                            placeholder="Vòng Sơ loại..."
                            className="rounded-lg h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Bắt đầu <span className="text-rose-500">*</span></label>
                          <Input
                            type="date"
                            value={round.StartDate}
                            onChange={(e) => updateFormRound(round.id, 'StartDate', e.target.value)}
                            className="rounded-lg h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Kết thúc <span className="text-rose-500">*</span></label>
                          <Input
                            type="date"
                            value={round.EndDate}
                            onChange={(e) => updateFormRound(round.id, 'EndDate', e.target.value)}
                            className="rounded-lg h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-slate-500 uppercase">Hạn nộp bài <span className="text-rose-500">*</span></label>
                          <Input
                            type="date"
                            value={round.SubmissionDeadline}
                            onChange={(e) => updateFormRound(round.id, 'SubmissionDeadline', e.target.value)}
                            className="rounded-lg h-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-semibold"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="event-description" className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Mô tả <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="event-description"
                rows={3}
                value={form.Description}
                onChange={(event) => updateForm('Description', event.target.value)}
                placeholder="Mô tả ngắn về nội dung và mục tiêu của Event."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none dark:bg-slate-800 dark:border-slate-700"
                required
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
              <div key={event.EventId} className="space-y-3 rounded-2xl bg-slate-50/80 p-4 shadow-sm dark:bg-slate-950/40">
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
                    <Badge className={`text-[9px] font-extrabold border ${event.IsPublished
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                      {event.IsPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                {(() => {
                  const eventCategoriesCount = categories.filter((c) => c.EventId === event.EventId).length;
                  const eventRoundsCount = event.Rounds ? event.Rounds.length : 0;
                  const canPublishEvent = eventCategoriesCount > 0 && eventRoundsCount > 0;

                  return (
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-lg border-0 bg-white/70 text-[10px] font-bold shadow-none hover:bg-white dark:bg-slate-900/70"
                        onClick={() => toggleEventDetails(event.EventId)}
                      >
                        Chi tiết
                        {expandedEventId === event.EventId && expandedSection === 'details' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-lg border-0 bg-white/70 text-[10px] font-bold shadow-none hover:bg-white dark:bg-slate-900/70"
                        disabled={creatingRound && roundEventId === event.EventId}
                        onClick={() => toggleEventSection(event.EventId, 'rounds')}
                      >
                        <CirclePlus className="w-3.5 h-3.5 mr-1" />
                        Vòng thi
                        {expandedEventId === event.EventId && expandedSection === 'rounds' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-lg border-0 bg-white/70 text-[10px] font-bold shadow-none hover:bg-white dark:bg-slate-900/70"
                        disabled={savingCategory && categoryEventId === event.EventId}
                        onClick={() => toggleEventSection(event.EventId, 'categories')}
                      >
                        <CirclePlus className="mr-1 h-3.5 w-3.5" />
                        Category
                        {expandedEventId === event.EventId && expandedSection === 'categories' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                      </Button>
                      {event.IsPublished ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="h-8 rounded-lg border-0 bg-white/70 text-[10px] font-bold shadow-none hover:bg-white dark:bg-slate-900/70"
                          disabled={eventActionId === event.EventId}
                          onClick={() => void handleEventHomeAction(event.EventId, 'unpublish')}
                        >
                          Gỡ Home
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          className={`h-8 rounded-lg text-[10px] font-bold transition-all ${canPublishEvent
                              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                              : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed opacity-75'
                            }`}
                          disabled={eventActionId === event.EventId || !canPublishEvent}
                          title={
                            !canPublishEvent
                              ? `Cần có ít nhất 1 Hạng mục (hiện có ${eventCategoriesCount}) và 1 Vòng thi (hiện có ${eventRoundsCount}) mới được Publish`
                              : 'Publish sự kiện lên Home page'
                          }
                          onClick={() => void handleEventHomeAction(event.EventId, 'publish')}
                        >
                          Publish
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-lg border-0 bg-white/70 text-[10px] font-bold shadow-none hover:bg-white dark:bg-slate-900/70"
                        disabled={eventActionId === event.EventId || !event.IsPublished}
                        onClick={() => void handleEventHomeAction(event.EventId, event.IsFeatured ? 'unfeature' : 'feature')}
                      >
                        {event.IsFeatured ? 'Bỏ ghim' : 'Ghim'}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-8 rounded-lg border-0 bg-rose-50 text-[10px] font-bold text-rose-600 shadow-none hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 flex items-center justify-center gap-1 cursor-pointer"
                        disabled={eventActionId === event.EventId}
                        onClick={() => void handleDeleteEvent(event.EventId)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Xóa
                      </Button>
                    </div>
                  );
                })()}

                {expandedEventId === event.EventId && (
                  <div className="space-y-3 rounded-xl bg-slate-100/70 p-4 dark:bg-slate-950/30">
                    {expandedSection === 'details' && (
                      editingEventId === event.EventId && editEventForm ? (
                        <form onSubmit={(e) => void handleUpdateEvent(e)} className="space-y-3 bg-white/80 p-4 rounded-xl dark:bg-slate-900/80">
                          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                            Chỉnh sửa thông tin Event
                          </div>
                          {editEventError && (
                            <div className="p-2 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-[10px] font-semibold">
                              {editEventError}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Tên Event</label>
                              <Input
                                required
                                value={editEventForm.EventName}
                                onChange={(e) => setEditEventForm({ ...editEventForm, EventName: e.target.value })}
                                className="h-8 rounded-lg text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Mùa</label>
                              <Input
                                required
                                value={editEventForm.Season}
                                onChange={(e) => setEditEventForm({ ...editEventForm, Season: e.target.value })}
                                className="h-8 rounded-lg text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Năm</label>
                              <Input
                                required
                                type="number"
                                value={editEventForm.Year}
                                onChange={(e) => setEditEventForm({ ...editEventForm, Year: Number(e.target.value) })}
                                className="h-8 rounded-lg text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Hình thức</label>
                              <select
                                value={editEventForm.Format}
                                onChange={(e) => setEditEventForm({ ...editEventForm, Format: e.target.value })}
                                className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold dark:bg-slate-900 dark:border-slate-700"
                              >
                                <option value="Online">Online</option>
                                <option value="Offline">Offline</option>
                                <option value="Hybrid">Hybrid</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Ngày bắt đầu</label>
                              <Input
                                required
                                type="date"
                                disabled={hasRegisteredTeams(event.EventId)}
                                value={editEventForm.StartDate}
                                onChange={(e) => setEditEventForm({ ...editEventForm, StartDate: e.target.value, Year: new Date(e.target.value).getFullYear() })}
                                className={`h-8 rounded-lg text-xs font-semibold ${hasRegisteredTeams(event.EventId) ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                              />
                              {hasRegisteredTeams(event.EventId) && (
                                <p className="text-[9px] text-amber-600">Không thể sửa khi đã có đội đăng ký</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Ngày kết thúc</label>
                              <Input
                                required
                                type="date"
                                disabled={hasRegisteredTeams(event.EventId)}
                                value={editEventForm.EndDate}
                                onChange={(e) => setEditEventForm({ ...editEventForm, EndDate: e.target.value })}
                                className={`h-8 rounded-lg text-xs font-semibold ${hasRegisteredTeams(event.EventId) ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
                              />
                              {hasRegisteredTeams(event.EventId) && (
                                <p className="text-[9px] text-amber-600">Không thể sửa khi đã có đội đăng ký</p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Đối tượng</label>
                              <Input
                                value={editEventForm.Audience}
                                onChange={(e) => setEditEventForm({ ...editEventForm, Audience: e.target.value })}
                                className="h-8 rounded-lg text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Giải thưởng</label>
                              <Input
                                value={editEventForm.Prize}
                                onChange={(e) => setEditEventForm({ ...editEventForm, Prize: e.target.value })}
                                className="h-8 rounded-lg text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Đơn vị tổ chức</label>
                              <Input
                                value={editEventForm.Organizer}
                                onChange={(e) => setEditEventForm({ ...editEventForm, Organizer: e.target.value })}
                                className="h-8 rounded-lg text-xs font-semibold"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block">Mô tả</label>
                              <textarea
                                rows={2}
                                value={editEventForm.Description}
                                onChange={(e) => setEditEventForm({ ...editEventForm, Description: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold focus:outline-none dark:bg-slate-900 dark:border-slate-700"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" className="h-8 rounded-lg text-[10px]" onClick={() => setEditingEventId(null)}>Hủy</Button>
                            <Button type="submit" disabled={savingEvent} className="h-8 rounded-lg bg-indigo-600 text-[10px] text-white hover:bg-indigo-700">
                              {savingEvent ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-3 bg-white/80 p-4 rounded-xl dark:bg-slate-900/80">
                          <div className="grid gap-2 text-[10px] text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
                            <span><strong className="text-slate-700 dark:text-slate-200">Mùa/Năm:</strong> {event.Season} {event.Year}</span>
                            <span><strong className="text-slate-700 dark:text-slate-200">Hình thức:</strong> {event.Format}</span>
                            <span><strong className="text-slate-700 dark:text-slate-200">Đối tượng:</strong> {event.Audience || 'Chưa cập nhật'}</span>
                            <span><strong className="text-slate-700 dark:text-slate-200">Giải thưởng:</strong> {event.Prize || 'Chưa cập nhật'}</span>
                            <span className="sm:col-span-2"><strong className="text-slate-700 dark:text-slate-200">Đơn vị tổ chức:</strong> {event.Organizer || 'Chưa cập nhật'}</span>
                            <span className="sm:col-span-2"><strong className="text-slate-700 dark:text-slate-200">Mô tả:</strong> {event.Description || 'Chưa cập nhật'}</span>
                          </div>
                          <div className="flex justify-end pt-1 border-t border-slate-100 dark:border-slate-800">
                            {hasRegisteredTeams(event.EventId) ? (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[9px] font-bold text-amber-600 italic">
                                  * Sự kiện đã có đội đăng ký tham gia, không thể sửa Round, Category, StartDate, EndDate.
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-[9px] font-bold text-emerald-600 italic">
                                  * Sự kiện chưa có đội đăng ký, có thể sửa Round, Category, StartDate, EndDate.
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-7 rounded-lg text-[10px] font-bold"
                                  onClick={() => startEditEvent(event)}
                                >
                                  <Pencil className="mr-1 h-3 w-3" /> Sửa thông tin sự kiện
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                    {(expandedSection === 'details' || expandedSection === 'categories') && (
                      <div className="space-y-2 rounded-xl bg-white/80 p-3 shadow-sm dark:bg-slate-900/70">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-bold text-slate-500">Category thi đấu</div>
                          {expandedSection === 'categories' && categories.filter((category) => category.EventId === event.EventId).length === 0 && (
                            hasRegisteredTeams(event.EventId) ? (
                              <span className="text-[9px] font-bold text-amber-600 italic">
                                Không thể thêm khi đã có đội đăng ký
                              </span>
                            ) : (
                              <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[10px]" onClick={() => toggleCategoryForm(event)}>
                                <CirclePlus className="mr-1 h-3 w-3" />Thêm Category
                              </Button>
                            )
                          )}
                          {hasRegisteredTeams(event.EventId) && categories.filter((category) => category.EventId === event.EventId).length > 0 && (
                            <span className="text-[9px] font-bold text-amber-600 italic">
                              Đã có đội đăng ký - không thể sửa Category
                            </span>
                          )}
                        </div>
                        {categories.filter((category) => category.EventId === event.EventId).length === 0 ? (
                          <p className="text-[10px] text-slate-400">Chưa có Category. Thêm ít nhất một Category để đội có thể đăng ký Event.</p>
                        ) : (
                          <div className="space-y-2">
                            {categories.filter((category) => category.EventId === event.EventId).map((category) => (
                              <div key={category.CategoryId} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-950/50">
                                <div className="min-w-0">
                                  <div className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{category.CategoryName}</div>
                                  {category.Description && <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{category.Description}</p>}
                                </div>
                                {!hasRegisteredTeams(event.EventId) && (
                                  <div className="flex shrink-0 gap-1">
                                    <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[10px]" disabled={savingCategory} onClick={() => handleEditCategory(category)}>
                                      <Pencil className="mr-1 h-3 w-3" /> Sửa
                                    </Button>
                                    <Button type="button" variant="outline" className="h-7 rounded-md border-rose-200 px-2 text-[10px] text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400" disabled={savingCategory} onClick={() => void handleDeleteCategory(category)}>
                                      <Trash2 className="mr-1 h-3 w-3" /> Xóa
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {expandedSection === 'categories' && categoryEventId === event.EventId && categoryForm && (
                      <form onSubmit={(submitEvent) => void handleSaveCategory(submitEvent)} className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                          {editingCategoryId ? 'Chỉnh sửa Category của' : 'Thêm Category cho'} {event.EventName}
                        </div>
                        {categoryError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">{categoryError}</div>}
                        {!editingCategoryId ? (
                          <div className="space-y-1.5">
                            <label htmlFor={`category-select-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Tên Category (Hệ thống)</label>
                            <select
                              id={`category-select-${event.EventId}`}
                              required
                              value={categoryForm.CategoryName}
                              className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
                              onChange={(e) => {
                                const val = e.target.value;
                                const found = uniqueCategories.find((uc) => uc.name === val);
                                if (found) {
                                  setCategoryForm((current) => current ? { ...current, CategoryName: found.name, Description: found.description } : current);
                                } else {
                                  setCategoryForm((current) => current ? { ...current, CategoryName: '', Description: '' } : current);
                                }
                              }}
                            >
                              <option value="">-- Chọn Category từ hệ thống --</option>
                              {uniqueCategories.map((uc) => (
                                <option key={uc.name} value={uc.name}>{uc.name}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Tên Category</span>
                            <div className="h-9 px-3 flex items-center rounded-lg border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-350">
                              {categoryForm.CategoryName}
                            </div>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <label htmlFor={`category-description-${event.EventId}`} className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Mô tả</label>
                          <textarea id={`category-description-${event.EventId}`} rows={2} maxLength={2000} value={categoryForm.Description} onChange={(inputEvent) => setCategoryForm((current) => current ? { ...current, Description: inputEvent.target.value } : current)} placeholder="Mô tả ngắn về hạng mục thi đấu." className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-900" />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" className="h-8 rounded-lg text-[10px]" onClick={() => toggleCategoryForm(event)}>Hủy</Button>
                          <Button type="submit" disabled={savingCategory || hasRegisteredTeams(event.EventId)} className="h-8 rounded-lg bg-indigo-600 text-[10px] hover:bg-indigo-700">{savingCategory ? 'Đang lưu...' : editingCategoryId ? 'Lưu thay đổi' : 'Tạo Category'}</Button>
                        </div>
                      </form>
                    )}

                    {(expandedSection === 'details' || expandedSection === 'rounds') && event.Rounds.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[10px] font-bold text-slate-500">Các vòng thi đã tạo</div>
                          {!hasRegisteredTeams(event.EventId) && expandedSection === 'rounds' && (
                            <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[10px]" onClick={() => toggleRoundForm(event)}><CirclePlus className="mr-1 h-3 w-3" />Thêm vòng thi</Button>
                          )}
                          {hasRegisteredTeams(event.EventId) && (
                            <span className="text-[9px] font-bold text-amber-600 italic">
                              Đã có đội đăng ký - không thể sửa/xóa Round
                            </span>
                          )}
                        </div>
                        {[...event.Rounds].sort((a, b) => a.RoundOrder - b.RoundOrder).map((round) => (
                          <div key={round.RoundId} className="rounded-xl bg-white p-3.5 text-[10px] shadow-sm dark:bg-slate-900">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold text-slate-800 dark:text-slate-100">Vòng {round.RoundOrder}: {round.RoundName}</div>
                                <div className="mt-1 text-slate-500 dark:text-slate-400">Diễn ra: {formatDate(round.StartDate)} – {formatDate(round.EndDate)}</div>
                                <div className="mt-1 text-slate-500 dark:text-slate-400">Hạn nộp bài: <strong className="text-slate-700 dark:text-slate-200">{formatDate(round.SubmissionDeadline)}</strong></div>
                              </div>
                              {!hasRegisteredTeams(event.EventId) && (
                                <div className="flex shrink-0 gap-1">
                                  <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[10px]" disabled={creatingRound} onClick={() => handleEditRound(event, round)}>
                                    <Pencil className="mr-1 h-3 w-3" /> Sửa
                                  </Button>
                                  <Button type="button" variant="outline" className="h-7 rounded-md border-rose-200 px-2 text-[10px] text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400" disabled={creatingRound} onClick={() => void handleDeleteRound(event, round.RoundId)}>
                                    <Trash2 className="mr-1 h-3 w-3" /> Xóa
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {expandedSection === 'rounds' && event.Rounds.length === 0 && (
                      <div className="space-y-2 rounded-xl bg-white p-3 dark:bg-slate-900">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] text-slate-400">Event chưa có vòng thi.</p>
                          {!hasRegisteredTeams(event.EventId) ? (
                            <Button type="button" variant="outline" className="h-7 rounded-md px-2 text-[10px]" onClick={() => toggleRoundForm(event)}><CirclePlus className="mr-1 h-3 w-3" />Thêm vòng thi</Button>
                          ) : (
                            <span className="text-[9px] font-bold text-amber-600 italic">
                              Không thể thêm khi đã có đội đăng ký
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {expandedSection === 'details' && event.Rounds.length > 0 && false && (
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

                    {expandedSection === 'rounds' && roundEventId === event.EventId && roundForm && (
                      <form onSubmit={(submitEvent) => void handleCreateRound(submitEvent, event)} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                        {hasRegisteredTeams(event.EventId) && (
                          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-semibold">
                            Không thể sửa vòng thi khi đã có đội đăng ký.
                          </div>
                        )}
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
                          <Button type="submit" disabled={creatingRound || hasRegisteredTeams(event.EventId)} className="h-8 rounded-lg bg-indigo-600 text-[10px] hover:bg-indigo-700">
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
            <div className="flex items-center justify-between pt-3 text-[10px] text-slate-500">
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
