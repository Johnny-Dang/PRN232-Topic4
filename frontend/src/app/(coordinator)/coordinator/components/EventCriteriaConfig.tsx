'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Criteria, Event, getEvents, getEventCriteria, setEventCriteria } from '@/lib/api';

export default function EventCriteriaConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [editingCriteria, setEditingCriteria] = useState<{ criteriaId: string; weight: number }[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const fetchedEvents = await getEvents();
        setEvents(fetchedEvents);
        if (fetchedEvents.length > 0 && !selectedEventId) {
          setSelectedEventId(fetchedEvents[0].EventID);
        }
      } catch (error) {
        console.error('Failed to load events:', error);
        setMessage('Không thể tải danh sách sự kiện.');
      } finally {
        setLoading(false);
      }
    };
    void loadEvents();
  }, []);

  useEffect(() => {
    const loadCriteria = async () => {
      if (!selectedEventId) {
        setCriteria([]);
        setEditingCriteria([]);
        return;
      }

      setLoading(true);
      try {
        const fetchedCriteria = await getEventCriteria(selectedEventId);
        setCriteria(fetchedCriteria);
        setEditingCriteria(fetchedCriteria.map((c) => ({ criteriaId: c.CriteriaID, weight: c.Weight })));
      } catch (error) {
        console.error('Failed to load criteria:', error);
        setMessage('Không thể tải criteria cho sự kiện này.');
      } finally {
        setLoading(false);
      }
    };
    void loadCriteria();
  }, [selectedEventId]);

  const totalWeight = editingCriteria.reduce((sum, c) => sum + c.weight, 0);

  const handleWeightChange = (criteriaId: string, value: string) => {
    const weight = parseFloat(value) || 0;
    setEditingCriteria((current) =>
      current.map((c) => (c.criteriaId === criteriaId ? { ...c, weight: Math.min(100, Math.max(0, weight)) } : c))
    );
  };

  const handleSave = async () => {
    if (!selectedEventId) return;

    setSaving(true);
    setMessage('');

    try {
      await setEventCriteria(
        selectedEventId,
        editingCriteria.map((c) => ({ criteriaId: c.criteriaId, weight: c.weight }))
      );
      setMessage('Đã lưu cấu hình criteria thành công!');
      const updatedCriteria = await getEventCriteria(selectedEventId);
      setCriteria(updatedCriteria);
    } catch (error) {
      console.error('Failed to save criteria:', error);
      setMessage('Không thể lưu cấu hình. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="event-select" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Chọn sự kiện
        </Label>
        <select
          id="event-select"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">-- Chọn sự kiện --</option>
          {events.map((event) => (
            <option key={event.EventID} value={event.EventID}>
              {event.EventName}
            </option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <>
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-base font-bold">Cấu hình Criteria cho sự kiện</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">
Tổng trọng số: {totalWeight}% (nếu khác 100%, hệ thống sẽ tự động chuẩn hóa)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">Sự kiện này chưa có criteria nào.</p>
              ) : (
                <div className="space-y-3">
                  {criteria.map((c) => {
                    const editing = editingCriteria.find((ec) => ec.criteriaId === c.CriteriaID);
                    return (
                      <div key={c.CriteriaID} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{c.CriteriaName}</p>
                          <p className="text-[10px] text-slate-400">{c.CriteriaID}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={editing?.weight ?? 0}
                            onChange={(e) => handleWeightChange(c.CriteriaID, e.target.value)}
                            className="h-9 w-20 rounded-lg border-slate-200 text-center text-sm font-bold dark:border-slate-700 dark:bg-slate-800"
                          />
                          <span className="text-sm font-semibold text-slate-400">%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  {totalWeight === 100 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <X className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Tổng trọng số: <strong className={totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}>{totalWeight}%</strong>
                  </span>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving || editingCriteria.length === 0}
                  className="h-9 rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-700"
                >
                  {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {message && (
            <div className={`rounded-xl border p-3 text-xs font-medium ${
              message.includes('thanh cong') || message.includes('success')
                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                : 'border-rose-100 bg-rose-50 text-rose-700'
            }`}>
              {message}
            </div>
          )}
        </>
      )}
    </div>
  );
}
