'use client';

import React, { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createTeamRecruitmentApi } from '@/services/api/recruitment';
import { CreateTeamRecruitmentRequest } from '@/services/types/recruitment';

interface CreateRecruitmentModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateRecruitmentModal({
  teamId,
  isOpen,
  onClose,
  onSuccess,
}: CreateRecruitmentModalProps) {
  const [formData, setFormData] = useState<CreateTeamRecruitmentRequest>({
    RoleNeeded: '',
    Description: '',
    Quantity: 1,
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.RoleNeeded.trim() || !formData.Description.trim()) {
      setError('Vui lòng điền đầy đủ thông tin vai trò và mô tả.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createTeamRecruitmentApi(teamId, formData);
      setFormData({ RoleNeeded: '', Description: '', Quantity: 1 });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Tạo bài tuyển dụng thất bại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <PlusCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Đăng tin Tuyển thành viên
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Đăng yêu cầu tìm kiếm đồng đội để nhận đơn đăng ký từ các thí sinh tự do.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Vai trò cần tuyển (Role Needed)
            </Label>
            <Input
              value={formData.RoleNeeded}
              onChange={(e) =>
                setFormData({ ...formData, RoleNeeded: e.target.value })
              }
              placeholder="VD: Frontend Developer, UI/UX Designer..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Số lượng tuyển
            </Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={formData.Quantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  Quantity: parseInt(e.target.value) || 1,
                })
              }
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Mô tả chi tiết & Yêu cầu
            </Label>
            <textarea
              value={formData.Description}
              onChange={(e) =>
                setFormData({ ...formData, Description: e.target.value })
              }
              placeholder="Mô tả công việc, kỹ năng ưu tiên hoặc thời gian làm việc nhóm..."
              rows={4}
              required
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Đăng tin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
