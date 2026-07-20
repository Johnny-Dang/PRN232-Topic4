'use client';

import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Mail, Award, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTeamApplicationsApi, processApplicationApi } from '@/services/api/application';
import { TeamApplication } from '@/services/types/application';

interface ApplicantListModalProps {
  teamId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function ApplicantListModal({
  teamId,
  isOpen,
  onClose,
  onUpdate,
}: ApplicantListModalProps) {
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadApplications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeamApplicationsApi(teamId);
      setApplications(data);
    } catch (err: unknown) {
      console.error('Lỗi lấy danh sách ứng viên:', err);
      setError('Không thể tải danh sách đơn ứng tuyển.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    if (!isOpen || !teamId) return;
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTeamApplicationsApi(teamId);
        if (isMounted) setApplications(data);
      } catch (err: unknown) {
        console.error('Lỗi lấy danh sách ứng viên:', err);
        if (isMounted) setError('Không thể tải danh sách đơn ứng tuyển.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [isOpen, teamId]);

  const handleProcess = async (applicationId: string, accept: boolean) => {
    setProcessingId(applicationId);
    try {
      await processApplicationApi(applicationId, { Accept: accept });
      await loadApplications();
      onUpdate?.();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Xử lý đơn ứng tuyển thất bại.';
      setError(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACCEPTED' || status === 'Accepted') {
      return (
        <Badge className="bg-emerald-500 text-white font-medium">
          <CheckCircle className="w-3 h-3 mr-1" /> Đã chấp nhận
        </Badge>
      );
    }
    if (status === 'REJECTED' || status === 'Rejected') {
      return (
        <Badge variant="destructive" className="font-medium">
          <XCircle className="w-3 h-3 mr-1" /> Đã từ chối
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-medium">
        Đang chờ duyệt
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Danh sách Đơn Ứng Tuyển vào Đội
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Xem hồ sơ, bộ kỹ năng và phê duyệt ứng viên ứng tuyển vào nhóm.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Chưa có đơn ứng tuyển nào nộp vào nhóm của bạn.
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {applications.map((app) => {
              const isPending =
                app.Status === 'Pending' || app.Status === 'PENDING';
              const isProcessing = processingId === app.ApplicationId;

              return (
                <div
                  key={app.ApplicationId}
                  className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                        {app.ApplicantName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        {app.ApplicantEmail}
                      </p>
                    </div>
                    <div>{getStatusBadge(app.Status)}</div>
                  </div>

                  {/* Applicant Message */}
                  {app.Message && (
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg text-xs text-slate-700 dark:text-slate-300 italic border border-slate-200/60 dark:border-slate-700/60">
                      &quot;{app.Message}&quot;
                    </div>
                  )}

                  {/* Applicant Skills */}
                  {app.ApplicantSkills && app.ApplicantSkills.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-indigo-500" /> Kỹ năng ứng viên:
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {app.ApplicantSkills.map((sk, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-[11px]"
                          >
                            {sk.Role ? `${sk.Role}: ` : ''}{sk.SkillName}
                            {sk.ExperienceLevel ? ` (${sk.ExperienceLevel})` : ''}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {isPending && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/50">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleProcess(app.ApplicationId, false)}
                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900"
                      >
                        {isProcessing && (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        )}
                        Từ chối
                      </Button>
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() => handleProcess(app.ApplicationId, true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
                      >
                        {isProcessing && (
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        )}
                        Đồng ý cho gia nhập
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
