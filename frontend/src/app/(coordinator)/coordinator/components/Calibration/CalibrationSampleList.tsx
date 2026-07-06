'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, FileSpreadsheet, Loader2, MoreHorizontal, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CalibrationAnalysis,
  CalibrationSubmission,
  deleteCalibrationSubmission,
  getCalibrationSubmissions,
  getEvents,
  Event,
} from '@/lib/api';

import CalibrationDetailView from './CalibrationDetailView';
import CalibrationAnalysisPanel from './CalibrationAnalysisPanel';
import CalibrationExportButton from './CalibrationExportButton';
import CreateCalibrationDialog from './CreateCalibrationDialog';

interface CalibrationSampleListProps {
  onRefresh?: () => void;
}

export default function CalibrationSampleList({
  onRefresh,
}: CalibrationSampleListProps) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<CalibrationSubmission[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [selectedSubmission, setSelectedSubmission] =
    useState<CalibrationSubmission | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [analysisSubmission, setAnalysisSubmission] =
    useState<CalibrationSubmission | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<CalibrationAnalysis | null>(
    null
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const filters: { eventId?: string; status?: string } = {};
      if (selectedEventId !== 'all') {
        filters.eventId = selectedEventId;
      }
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      const fetchedSubmissions = await getCalibrationSubmissions(filters);
      setSubmissions(fetchedSubmissions);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Không thể tải danh sách bài mẫu');
    } finally {
      setLoading(false);
    }
  }, [selectedEventId, selectedStatus]);

  const loadEvents = async () => {
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const handleRefresh = () => {
    void loadSubmissions();
    onRefresh?.();
  };

  const handleViewDetail = (submission: CalibrationSubmission) => {
    setSelectedSubmission(submission);
    setDetailOpen(true);
  };

  const handleAnalyze = async (submission: CalibrationSubmission) => {
    setAnalysisSubmission(submission);
    setAnalysisOpen(true);
    setLoadingAnalysis(true);

    try {
      const { getCalibrationAnalysis } = await import('@/lib/api');
      const analysis = await getCalibrationAnalysis(submission.CalibrationId);
      setAnalysisData(analysis);
    } catch (error) {
      console.error('Failed to load analysis:', error);
      toast.error('Không thể tải phân tích');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleDelete = async (submission: CalibrationSubmission) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa bài mẫu "${submission.CalibrationTitle}"?`
      )
    ) {
      return;
    }

    setDeletingId(submission.CalibrationId);
    try {
      await deleteCalibrationSubmission(submission.CalibrationId);
      toast.success('Đã xóa bài mẫu thành công');
      void loadSubmissions();
    } catch (error) {
      console.error('Failed to delete submission:', error);
      toast.error('Không thể xóa bài mẫu. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: CalibrationSubmission['Status']) => {
    switch (status) {
      case 'Pending':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            Chưa có điểm
          </Badge>
        );
      case 'InProgress':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            Đang chấm
          </Badge>
        );
      case 'Completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Hoàn thành
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Bài mẫu Calibration</h2>
          <Badge variant="secondary">{submissions.length}</Badge>
        </div>

        <CreateCalibrationDialog onSuccess={handleRefresh} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={selectedEventId} onValueChange={(value) => setSelectedEventId(value || 'all')}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo sự kiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả sự kiện</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.EventID} value={event.EventID}>
                {event.EventName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value || 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="Pending">Chưa có điểm</SelectItem>
            <SelectItem value="InProgress">Đang chấm</SelectItem>
            <SelectItem value="Completed">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Tiêu đề</TableHead>
              <TableHead>Sự kiện</TableHead>
              <TableHead>Vòng</TableHead>
              <TableHead className="text-center">Số Judge</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px] mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px] mx-auto" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Target className="size-8" />
                    <p>Chưa có bài mẫu calibration nào</p>
                    <p className="text-sm">
                      Nhấn &quot;Tạo bài mẫu mới&quot; để bắt đầu
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.CalibrationId}>
                  <TableCell className="font-medium">
                    {submission.CalibrationTitle}
                  </TableCell>
                  <TableCell>{submission.EventName || '-'}</TableCell>
                  <TableCell>{submission.RoundName || '-'}</TableCell>
                  <TableCell className="text-center">
                    {submission.JudgeCount}
                    {submission.TotalJudges && submission.TotalJudges > 0 && (
                      <span className="text-muted-foreground">
                        /{submission.TotalJudges}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(submission.Status)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(submission.SubmittedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={deletingId === submission.CalibrationId}
                        >
                          {deletingId === submission.CalibrationId ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <MoreHorizontal className="size-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDetail(submission)}
                        >
                          <Eye className="size-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAnalyze(submission)}
                          disabled={submission.JudgeCount === 0}
                        >
                          <Target className="size-4" />
                          Phân tích
                        </DropdownMenuItem>
                        <CalibrationExportButton
                          calibrationId={submission.CalibrationId}
                          calibrationTitle={submission.CalibrationTitle}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              disabled={submission.JudgeCount === 0}
                            >
                              <FileSpreadsheet className="size-4" />
                              Export CSV
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(submission)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="size-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      {selectedSubmission && (
        <CalibrationDetailView
          submission={selectedSubmission}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}

      {/* Analysis Panel */}
      {analysisSubmission && (
        <CalibrationAnalysisPanel
          submission={analysisSubmission}
          analysis={analysisData}
          loading={loadingAnalysis}
          open={analysisOpen}
          onOpenChange={setAnalysisOpen}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
