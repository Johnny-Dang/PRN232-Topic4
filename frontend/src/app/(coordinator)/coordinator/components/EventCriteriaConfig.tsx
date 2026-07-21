'use client';

import { useEffect, useState } from 'react';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Criteria, Event, getEvents, getEventCriteria, setEventCriteria } from '@/lib/api';

export default function EventCriteriaConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [editingCriteria, setEditingCriteria] = useState<{ criteriaId: string; weight: number }[]>([]);

  // State cho Modal Tạo Criteria mới
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaWeight, setNewCriteriaWeight] = useState('20');
  const [addError, setAddError] = useState('');

  useEffect(() => {
    let isSubscribed = true;
    queueMicrotask(() => {
      if (isSubscribed) setLoading(true);
    });

    getEvents()
      .then((fetchedEvents) => {
        if (!isSubscribed) return;
        setEvents(fetchedEvents);
        if (fetchedEvents.length > 0) {
          setSelectedEventId((prev) => prev || fetchedEvents[0].EventID);
        }
      })
      .catch((error) => {
        console.error('Failed to load events:', error);
        if (isSubscribed) toast.error('Không thể tải danh sách sự kiện.');
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }

    let isSubscribed = true;
    queueMicrotask(() => {
      if (isSubscribed) setLoading(true);
    });

    getEventCriteria(selectedEventId)
      .then((fetchedCriteria) => {
        if (!isSubscribed) return;
        setCriteria(fetchedCriteria);
        setEditingCriteria(
          fetchedCriteria.map((c) => ({
            criteriaId: c.CriteriaID,
            weight: c.Weight > 0 && c.Weight <= 1 ? Math.round(c.Weight * 100) : c.Weight,
          }))
        );
      })
      .catch((error) => {
        console.error('Failed to load criteria:', error);
        if (isSubscribed) toast.error('Không thể tải criteria cho sự kiện này.');
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [selectedEventId]);

  const totalWeight = editingCriteria.reduce((sum, c) => sum + c.weight, 0);

  const handleWeightChange = (criteriaId: string, value: string) => {
    const weight = parseFloat(value) || 0;
    setEditingCriteria((current) =>
      current.map((c) => (c.criteriaId === criteriaId ? { ...c, weight: Math.min(100, Math.max(0, weight)) } : c))
    );
  };

  const generateGuid = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const handleAddCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCriteriaName.trim();
    const weight = Math.min(100, Math.max(1, parseFloat(newCriteriaWeight) || 0));

    if (!name) {
      setAddError('Vui lòng nhập tên tiêu chí.');
      return;
    }

    if (weight <= 0) {
      setAddError('Trọng số phải lớn hơn 0%.');
      return;
    }

    const newCriteriaId = generateGuid();
    const newCriteriaObj: Criteria = {
      CriteriaID: newCriteriaId,
      CriteriaName: name,
      Weight: weight,
    };

    setCriteria((prev) => [...prev, newCriteriaObj]);
    setEditingCriteria((prev) => [...prev, { criteriaId: newCriteriaId, weight }]);

    setNewCriteriaName('');
    setNewCriteriaWeight('20');
    setAddError('');
    setIsAddOpen(false);
    toast.success('Đã thêm tiêu chí mới vào danh sách. Hãy nhấn "Lưu cấu hình" để cập nhật hệ thống.');
  };

  const handleRemoveCriteria = (criteriaId: string) => {
    setCriteria((prev) => prev.filter((c) => c.CriteriaID !== criteriaId));
    setEditingCriteria((prev) => prev.filter((ec) => ec.criteriaId !== criteriaId));
    toast.info('Đã xóa tiêu chí khỏi danh sách. Hãy nhấn "Lưu cấu hình" để hoàn tất.');
  };

  const handleSave = async () => {
    if (!selectedEventId) return;

    if (totalWeight !== 100) {
      toast.warning('Tổng trọng số tất cả tiêu chí phải bằng đúng 100% để lưu cấu hình.');
      return;
    }

    setSaving(true);

    try {
      await setEventCriteria(
        selectedEventId,
        editingCriteria.map((c) => {
          const match = criteria.find((item) => item.CriteriaID === c.criteriaId);
          return {
            criteriaId: c.criteriaId,
            criteriaName: match?.CriteriaName,
            weight: c.weight,
          };
        })
      );
      toast.success('Đã lưu cấu hình criteria thành công!');
      const updatedCriteria = await getEventCriteria(selectedEventId);
      setCriteria(updatedCriteria);
      setEditingCriteria(
        updatedCriteria.map((c) => ({
          criteriaId: c.CriteriaID,
          weight: c.Weight > 0 && c.Weight <= 1 ? Math.round(c.Weight * 100) : c.Weight,
        }))
      );
    } catch (error) {
      console.error('Failed to save criteria:', error);
      toast.error('Không thể lưu cấu hình. Vui lòng thử lại.');
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
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Cấu hình Criteria cho sự kiện</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-400">
                    Tổng trọng số: {totalWeight}% (Cần đạt đúng 100% để có thể lưu cấu hình)
                  </CardDescription>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                  <DialogTrigger render={<Button size="sm" className="h-9 gap-1.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700">
                    <Plus className="h-4 w-4" /> Thêm tiêu chí mới
                  </Button>} />
                  <DialogContent className="sm:max-w-md">
                    <form onSubmit={handleAddCriteria}>
                      <DialogHeader>
                        <DialogTitle className="text-base font-bold">Thêm Tiêu Chí Chấm Điểm Mới</DialogTitle>
                        <DialogDescription className="text-xs text-slate-500">
                          Tạo tiêu chí chấm điểm mới và gán vào sự kiện hiện tại.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="new-criteria-name" className="text-xs font-semibold">
                            Tên tiêu chí <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="new-criteria-name"
                            placeholder="VD: Tính sáng tạo & Ứng dụng thực tế"
                            value={newCriteriaName}
                            onChange={(e) => setNewCriteriaName(e.target.value)}
                            className="h-10 rounded-xl"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="new-criteria-weight" className="text-xs font-semibold">
                            Trọng số (%) <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            id="new-criteria-weight"
                            type="number"
                            min={1}
                            max={100}
                            placeholder="20"
                            value={newCriteriaWeight}
                            onChange={(e) => setNewCriteriaWeight(e.target.value)}
                            className="h-10 rounded-xl"
                          />
                        </div>

                        {addError && <p className="text-xs font-medium text-rose-500">{addError}</p>}
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                          Hủy
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                          Thêm tiêu chí
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteria.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">Sự kiện này chưa có criteria nào. Nhấn &quot;+ Thêm tiêu chí mới&quot; để khởi tạo.</p>
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
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Xóa tiêu chí này"
                            className="h-8 w-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                            onClick={() => handleRemoveCriteria(c.CriteriaID)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                  disabled={saving || editingCriteria.length === 0 || totalWeight !== 100}
                  className="h-9 rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50"
                  title={totalWeight !== 100 ? "Tổng trọng số phải đạt đúng 100% để lưu" : undefined}
                >
                  {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
