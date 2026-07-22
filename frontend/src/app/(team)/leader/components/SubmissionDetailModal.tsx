'use client';

import React, { useEffect, useState } from 'react';
import {
  FileCode2,
  Video,
  FileText,
  ExternalLink,
  Calendar,
  Users,
  Trophy,
  Award,
  Pencil,
  Copy,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getScores,
  getSubmissionAssets,
  type Event as ApiEvent,
  type Round as ApiRound,
  type Submission,
  type SubmissionAsset,
  type Team,
} from '@/lib/api';

type SubmissionWithTeam = Submission & { Team: Team };
type ScoreWithDetails = Awaited<ReturnType<typeof getScores>>[number];

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: SubmissionWithTeam | null;
  team: Team | null;
  event: ApiEvent | null;
  round: ApiRound | null;
  onEdit?: (submission: SubmissionWithTeam) => void;
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const getSubmissionStatusBadge = (status?: Submission['Status']) => {
  switch (status) {
    case 'Graded':
      return <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-700">Đã chấm điểm</Badge>;
    case 'Updated':
      return <Badge className="border border-amber-100 bg-amber-50 text-amber-700">Đã cập nhật</Badge>;
    case 'Disqualified':
      return <Badge className="border border-rose-100 bg-rose-50 text-rose-700">Đã loại</Badge>;
    default:
      return <Badge className="border border-blue-100 bg-blue-50 text-blue-700">Đã nộp bài</Badge>;
  }
};

export default function SubmissionDetailModal({
  isOpen,
  onClose,
  submission,
  team,
  event,
  round,
  onEdit,
}: SubmissionDetailModalProps) {
  const [scores, setScores] = useState<ScoreWithDetails[]>([]);
  const [assets, setAssets] = useState<SubmissionAsset[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!submission || !isOpen) {
      const resetTimer = setTimeout(() => {
        setScores([]);
        setAssets([]);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    let cancelled = false;
    const loadingTimer = setTimeout(() => {
      setLoadingDetails(true);
    }, 0);

    const fetchDetails = async () => {
      try {
        const [scoresData, assetsData] = await Promise.all([
          getScores(submission.SubmissionID),
          getSubmissionAssets(submission.SubmissionID),
        ]);
        if (!cancelled) {
          setScores(scoresData);
          setAssets(assetsData);
        }
      } catch (err) {
        console.error('Failed to load submission details:', err);
      } finally {
        if (!cancelled) {
          setLoadingDetails(false);
        }
      }
    };

    void fetchDetails();

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
    };
  }, [submission, isOpen]);

  if (!submission) return null;

  const videoAsset = assets.find((a) => a.AssetType === 'VideoDemo');
  const slideAsset = assets.find((a) => a.AssetType === 'SlideDocument');

  const handleCopyUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:max-w-2xl">
        <DialogHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Chi tiết bài nộp dự án
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Xem toàn bộ thông tin bài nộp, thông tin đội thi, vòng thi và tài liệu đính kèm.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đội thi</p>
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {submission.Team?.TeamName || team?.TeamName || 'Chưa xác định'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sự kiện</p>
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {event?.EventName || 'Chưa gắn sự kiện'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vòng thi</p>
                <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                  {round?.RoundName || 'Vòng thi hiện tại'}
                </p>
                {round?.SubmissionDeadline && (
                  <p className="text-[10px] text-slate-400">Hạn nộp: {formatDateTime(round.SubmissionDeadline)}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Thời gian nộp bài</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {formatDateTime(submission.SubmittedAt)}
                </p>
                <div className="mt-1">{getSubmissionStatusBadge(submission.Status)}</div>
              </div>
            </div>
          </div>

          {/* Submission Details Content */}
          <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Nội dung bài nộp</h4>

            {/* GitHub Repo */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="flex items-center gap-3 min-w-0">
                <FileCode2 className="h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">GitHub Repository</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {submission.RepositoryURL || 'Chưa cung cấp đường dẫn GitHub'}
                  </p>
                </div>
              </div>
              {submission.RepositoryURL && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
                    onClick={() => handleCopyUrl(submission.RepositoryURL!)}
                    title="Sao chép liên kết"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <a
                    href={submission.RepositoryURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-700"
                    title="Mở liên kết"
                  >
                    <ExternalLink className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </a>
                </div>
              )}
            </div>

            {/* Video Demo */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="flex items-center gap-3 min-w-0">
                <Video className="h-5 w-5 shrink-0 text-rose-500" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Video Demo {videoAsset?.OriginalFileName ? `(${videoAsset.OriginalFileName})` : ''}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {videoAsset?.SecureUrl
                      ? `${formatFileSize(videoAsset.FileSize)} · ${videoAsset.Format || videoAsset.ResourceType}`
                      : submission.DemoURL || 'Chưa có file/link video demo'}
                  </p>
                </div>
              </div>
              {(videoAsset?.SecureUrl || submission.DemoURL) && (
                <a
                  href={videoAsset?.SecureUrl || submission.DemoURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-700"
                  title="Xem video demo"
                >
                  <ExternalLink className="h-4 w-4 text-rose-500" />
                </a>
              )}
            </div>

            {/* Slide / Document */}
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-indigo-500" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Slide / Tài liệu báo cáo {slideAsset?.OriginalFileName ? `(${slideAsset.OriginalFileName})` : ''}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {slideAsset?.SecureUrl
                      ? `${formatFileSize(slideAsset.FileSize)} · ${slideAsset.Format || slideAsset.ResourceType}`
                      : submission.SlideURL || 'Chưa có file/link tài liệu báo cáo'}
                  </p>
                </div>
              </div>
              {(slideAsset?.SecureUrl || submission.SlideURL) && (
                <a
                  href={slideAsset?.SecureUrl || submission.SlideURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-700"
                  title="Mở tài liệu"
                >
                  <ExternalLink className="h-4 w-4 text-indigo-500" />
                </a>
              )}
            </div>
          </div>

          {/* Scores Section */}
          <div className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Award className="h-4 w-4 text-amber-500" /> Điểm đánh giá & Nhận xét
              </h4>
              {scores.length > 0 && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Tổng {scores.length} tiêu chí
                </Badge>
              )}
            </div>

            {loadingDetails ? (
              <p className="py-2 text-center text-xs text-slate-400">Đang tải điểm đánh giá...</p>
            ) : scores.length === 0 ? (
              <p className="py-2 text-center text-xs text-slate-400">Chưa có điểm đánh giá nào cho bài nộp này.</p>
            ) : (
              <div className="space-y-2">
                {scores.map((score) => (
                  <div
                    key={score.ScoreID}
                    className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{score.Criteria.CriteriaName}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        Nhận xét: &quot;{score.Comment || 'Không có nhận xét'}&quot;
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-black text-indigo-600 dark:text-indigo-400">
                      {score.ScoreValue.toFixed(1)} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800 sm:justify-between">
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(submission);
                onClose();
              }}
              className="rounded-xl border-indigo-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Chỉnh sửa bài nộp này
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs font-bold"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
