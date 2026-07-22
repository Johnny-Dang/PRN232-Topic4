'use client';

import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createCategoryApi, deleteCategoryApi, updateCategoryApi } from '@/services/api/competition';
import type { Category, Event } from '@/services/types/competition';
import { getApiErrorMessage } from './helpers';

interface CategoryManagerProps {
  categories: Category[];
  events: Event[];
  selectedEventId: string;
  onSelectedEventChange: (eventId: string) => void;
  onCategoriesChange: (categories: Category[]) => void;
}

const CATEGORIES_PER_PAGE = 6;

const DEFAULT_CATEGORIES = [
  { name: 'Phát triển Phần mềm', description: 'Các dự án ứng dụng và hệ thống phần mềm' },
  { name: 'Trí tuệ nhân tạo (AI)', description: 'Các dự án AI, Machine Learning và Deep Learning' },
  { name: 'Internet of Things (IoT)', description: 'Các dự án kết nối thiết bị thông minh và phần cứng' },
  { name: 'Phát triển Game', description: 'Các dự án thiết kế và lập trình trò chơi' },
  { name: 'An toàn thông tin', description: 'Các dự án bảo mật, kiểm thử và an ninh mạng' },
  { name: 'Điện toán đám mây', description: 'Các giải pháp hạ tầng và ứng dụng Cloud' },
  { name: 'Công nghệ Blockchain', description: 'Các dự án phân tán, hợp đồng thông minh và Web3' }
];

const emptyForm = (eventId = '') => ({
  EventId: eventId,
  CategoryName: '',
  Description: '',
});

export default function CategoryManager({ categories, events, selectedEventId, onSelectedEventChange, onCategoriesChange }: CategoryManagerProps) {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [editingCategoryId, setEditingCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const visibleCategories = useMemo(
    () => categories.filter((category) => !selectedEventId || category.EventId === selectedEventId),
    [categories, selectedEventId],
  );
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

  const totalPages = Math.max(1, Math.ceil(visibleCategories.length / CATEGORIES_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pagedCategories = visibleCategories.slice((safePage - 1) * CATEGORIES_PER_PAGE, safePage * CATEGORIES_PER_PAGE);

  const resetForm = () => {
    setForm(emptyForm(selectedEventId));
    setEditingCategoryId('');
    setError('');
  };

  const handleSubmit = async (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const savedCategory = editingCategoryId
        ? await updateCategoryApi(editingCategoryId, form)
        : await createCategoryApi(form);

      onCategoriesChange(editingCategoryId
        ? categories.map((category) => category.CategoryId === savedCategory.CategoryId ? savedCategory : category)
        : [...categories, savedCategory]);
      setMessage(editingCategoryId ? 'Đã cập nhật Category.' : 'Đã tạo Category cho Event.');
      resetForm();
    } catch (submitError: unknown) {
      console.error(submitError);
      setError(getApiErrorMessage(submitError, 'Không thể lưu Category.'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setForm({
      EventId: category.EventId,
      CategoryName: category.CategoryName,
      Description: category.Description,
    });
    setEditingCategoryId(category.CategoryId);
    setError('');
    setMessage('');
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Bạn có chắc muốn xóa Category "${category.CategoryName}"?`)) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      await deleteCategoryApi(category.CategoryId);
      onCategoriesChange(categories.filter((item) => item.CategoryId !== category.CategoryId));
      if (editingCategoryId === category.CategoryId) resetForm();
      setMessage('Đã xóa Category.');
    } catch (deleteError: unknown) {
      console.error(deleteError);
      setError(getApiErrorMessage(deleteError, 'Không thể xóa Category.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold"><Tags className="h-5 w-5 text-indigo-600" /> Quản lý Category</CardTitle>
        <CardDescription className="text-xs">Tạo hạng mục thi đấu và gán trực tiếp cho từng Event.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">{error}</div>}
        {message && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">{message}</div>}

        <form onSubmit={(submitEvent) => void handleSubmit(submitEvent)} className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/10">
          <div className="text-xs font-black uppercase tracking-widest text-indigo-600">{editingCategoryId ? 'Chỉnh sửa Category' : 'Tạo Category mới'}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {!editingCategoryId ? (
              <div className="space-y-1.5">
                <label htmlFor="category-select" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Tên Category (Hệ thống)</label>
                <select
                  id="category-select"
                  required
                  value={form.CategoryName}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = uniqueCategories.find((uc) => uc.name === val);
                    if (found) {
                      setForm((current) => ({ ...current, CategoryName: found.name, Description: found.description }));
                    } else {
                      setForm((current) => ({ ...current, CategoryName: '', Description: '' }));
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
                <div className="h-10 px-3 flex items-center rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-350">
                  {form.CategoryName}
                </div>
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="category-event" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Event</label>
              <select id="category-event" required value={form.EventId} onChange={(event) => setForm((current) => ({ ...current, EventId: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">
                <option value="">Chọn Event</option>
                {events
                  .filter((event) => {
                    if (editingCategoryId) return true;
                    return categories.every((cat) => cat.EventId !== event.EventId);
                  })
                  .map((event) => <option key={event.EventId} value={event.EventId}>{event.EventName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="category-description" className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Mô tả</label>
              <textarea id="category-description" rows={3} maxLength={2000} value={form.Description} onChange={(event) => setForm((current) => ({ ...current, Description: event.target.value }))} placeholder="Mô tả ngắn về hạng mục thi đấu." className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-900" />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {editingCategoryId && <Button type="button" variant="outline" className="h-9 rounded-xl text-xs" onClick={resetForm}>Hủy</Button>}
            <Button type="submit" disabled={saving || events.length === 0} className="h-9 rounded-xl bg-indigo-600 text-xs font-bold hover:bg-indigo-700"><Plus className="mr-1 h-3.5 w-3.5" />{saving ? 'Đang lưu...' : editingCategoryId ? 'Lưu thay đổi' : 'Tạo Category'}</Button>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-slate-400">Danh sách Category</div>
            <select value={selectedEventId} onChange={(event) => { onSelectedEventChange(event.target.value); setPage(1); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold dark:border-slate-700 dark:bg-slate-900">
              <option value="">Tất cả Event</option>
              {events.map((event) => <option key={event.EventId} value={event.EventId}>{event.EventName}</option>)}
            </select>
          </div>
          {visibleCategories.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">Chưa có Category phù hợp.</p>
          ) : pagedCategories.map((category) => {
            const event = events.find((item) => item.EventId === category.EventId);
            return <div key={category.CategoryId} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{category.CategoryName}</div>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">{event?.EventName || 'Event không tồn tại'}</p>
                {category.Description && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{category.Description}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="outline" className="h-8 rounded-lg px-2 text-[10px]" disabled={saving} onClick={() => handleEdit(category)}><Pencil className="mr-1 h-3.5 w-3.5" />Sửa</Button>
                <Button type="button" variant="outline" className="h-8 rounded-lg border-rose-200 px-2 text-[10px] text-rose-600 hover:bg-rose-50 dark:border-rose-900/50 dark:text-rose-400" disabled={saving} onClick={() => void handleDelete(category)}><Trash2 className="mr-1 h-3.5 w-3.5" />Xóa</Button>
              </div>
            </div>;
          })}
          {visibleCategories.length > CATEGORIES_PER_PAGE && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] text-slate-500 dark:border-slate-800">
              <span>Trang {safePage}/{totalPages} · {visibleCategories.length} Category</span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="h-7 rounded-lg px-2 text-[10px]" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Trước</Button>
                <Button type="button" variant="outline" className="h-7 rounded-lg px-2 text-[10px]" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Sau</Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
