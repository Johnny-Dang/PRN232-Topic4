'use client';

import React, { useMemo, useState } from 'react';
import { AlertCircle, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubmissionWithTeam } from './types';

interface DisqualifyPanelProps {
  submissions: SubmissionWithTeam[];
}

export default function DisqualifyPanel({ submissions }: DisqualifyPanelProps) {
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [reason, setReason] = useState('');

  const availableSubmissions = useMemo(
    () => submissions.filter((submission) => submission.Status !== 'Disqualified'),
    [submissions]
  );

  const selectedSubmissionId = submissionId || availableSubmissions[0]?.SubmissionID || '';

  const handleDisqualify = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('Backend chưa có API loại bài/ghi elimination, nên frontend không tạo dữ liệu giả.');
  };

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold text-rose-600 dark:text-rose-400">
          <Trash2 className="h-5 w-5" />
          Thực thi loại đội
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Chức năng này cần endpoint backend riêng để cập nhật submission, elimination và audit log.
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
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              value={selectedSubmissionId}
              onChange={(event) => setSubmissionId(event.target.value)}
              disabled={availableSubmissions.length === 0}
            >
              {availableSubmissions.length === 0 ? (
                <option value="">Không có bài nộp hợp lệ từ API</option>
              ) : (
                availableSubmissions.map((submission) => (
                  <option key={submission.SubmissionID} value={submission.SubmissionID}>
                    {submission.Team.TeamName || 'Đội thi'} (ID: {submission.SubmissionID.substring(0, 8)})
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
              placeholder="Nhập lý do để gửi khi backend bổ sung API loại bài."
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          {message && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-10 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white transition-colors hover:bg-rose-700"
              disabled={availableSubmissions.length === 0}
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              Kiểm tra API loại bài
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
