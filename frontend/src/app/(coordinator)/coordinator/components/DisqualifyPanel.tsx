'use client';

import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { disqualifySubmission } from '@/lib/api';
import { parseApiError } from '@/lib/errorHandler';
import type { SubmissionWithTeam } from './types';

interface DisqualifyPanelProps {
  submissions: SubmissionWithTeam[];
  onSuccess?: () => void;
}

export default function DisqualifyPanel({ submissions, onSuccess }: DisqualifyPanelProps) {
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableSubmissions = useMemo(
    () => submissions.filter((submission) => submission.Status !== 'Disqualified'),
    [submissions]
  );

  const selectedSubmissionId = submissionId || availableSubmissions[0]?.SubmissionID || '';

  const handleDisqualify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSubmissionId) {
      setErrorMsg('Vui lòng chọn bài nộp cần loại.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      await disqualifySubmission(selectedSubmissionId, reason);
      setMessage('Đã loại bài nộp thành công!');
      setReason('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error(err);
      const { message: apiErr } = parseApiError(err);
      setErrorMsg(apiErr || 'Không thể loại bài nộp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
          <Trash2 className="h-5 w-5" />
          Thực thi loại đội
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Loại bài nộp vi phạm quy chế thi. Hệ thống sẽ ghi nhận quyết định và tự động tạo Nhật ký hoạt động.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <form onSubmit={handleDisqualify} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="disqualify-submission" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chọn bài nộp của đội
            </label>
            <select
              id="disqualify-submission"
              aria-label="Chọn bài nộp của đội để loại"
              title="Chọn bài nộp của đội để loại"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              value={selectedSubmissionId}
              onChange={(event) => setSubmissionId(event.target.value)}
              disabled={availableSubmissions.length === 0 || submitting}
            >
              {availableSubmissions.length === 0 ? (
                <option value="">Không có bài nộp hợp lệ từ API</option>
              ) : (
                availableSubmissions.map((submission) => (
                  <option key={submission.SubmissionID} value={submission.SubmissionID}>
                    {submission.Team?.TeamName || 'Đội thi'} (ID: {submission.SubmissionID.substring(0, 8)})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="disqualify-reason" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Lý do loại bỏ chính thức
            </label>
            <textarea
              id="disqualify-reason"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              placeholder="Nhập lý do chi tiết loại bài nộp (ví dụ: Vi phạm bản quyền, Nộp bài sai yêu cầu...)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={submitting}
            />
          </div>

          {message && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {message}
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-10 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              disabled={availableSubmissions.length === 0 || submitting}
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              {submitting ? 'Đang thực thi...' : 'Thực thi loại đội'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
