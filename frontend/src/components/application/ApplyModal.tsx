'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { applyToTeamApi } from '@/services/api/application';
import { TeamRecruitment } from '@/services/types/recruitment';

interface ApplyModalProps {
  recruitment: TeamRecruitment | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ApplyModal({
  recruitment,
  isOpen,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!recruitment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Vui lòng nhập lời nhắn ứng tuyển.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await applyToTeamApi(recruitment.RecruitmentId, { Message: message });
      setMessage('');
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Nộp đơn ứng tuyển thất bại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Ứng tuyển vào {recruitment.TeamName}
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Ứng tuyển cho vị trí: <strong className="text-indigo-600 dark:text-indigo-400">{recruitment.RoleNeeded}</strong>
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
              Lời nhắn gửi Trưởng nhóm
            </Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Giới thiệu bản thân ngắn gọn, kinh nghiệm nổi bật hoặc lý do bạn muốn gia nhập đội thi..."
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              {submitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Gửi đơn ứng tuyển
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
