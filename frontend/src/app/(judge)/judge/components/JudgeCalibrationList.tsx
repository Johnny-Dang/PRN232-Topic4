'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Clock, Target, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalibrationSubmission,
  getCalibrationSubmissions,
  getMyCalibrationScore,
} from '@/lib/api';

import JudgeCalibrationScoringForm from './JudgeCalibrationScoringForm';

interface CalibrationWithMyScore extends CalibrationSubmission {
  hasScored?: boolean;
}

interface JudgeCalibrationListProps {
  onScoreChange?: () => void;
}

export default function JudgeCalibrationList({
  onScoreChange,
}: JudgeCalibrationListProps) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<CalibrationWithMyScore[]>([]);
  const [selectedSubmission, setSelectedSubmission] =
    useState<CalibrationSubmission | null>(null);
  const [scoringOpen, setScoringOpen] = useState(false);
  const [checkingMyScore, setCheckingMyScore] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const fetched = await getCalibrationSubmissions();

      const withScores = await Promise.all(
        fetched.map(async (submission) => {
          setCheckingMyScore(submission.CalibrationId);
          try {
            const myScore = await getMyCalibrationScore(submission.CalibrationId);
            return { ...submission, hasScored: myScore.hasScored };
          } catch {
            return { ...submission, hasScored: false };
          } finally {
            setCheckingMyScore(null);
          }
        })
      );

      setSubmissions(withScores);
    } catch (error) {
      console.error('Failed to load submissions:', error);
      toast.error('Không thể tải danh sách bài mẫu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const handleOpenScoring = (submission: CalibrationSubmission) => {
    setSelectedSubmission(submission);
    setScoringOpen(true);
  };

  const handleScoreSuccess = () => {
    toast.success('Đã lưu điểm calibration thành công!');
    setScoringOpen(false);
    void loadSubmissions();
    onScoreChange?.();
  };

  const getStatusIcon = (submission: CalibrationWithMyScore) => {
    if (checkingMyScore === submission.CalibrationId) {
      return <Loader2 className="size-4 animate-spin text-muted-foreground" />;
    }
    if (submission.hasScored) {
      return <CheckCircle2 className="size-4 text-green-500" />;
    }
    return <Circle className="size-4 text-muted-foreground" />;
  };

  const getStatusBadge = (submission: CalibrationWithMyScore) => {
    if (checkingMyScore === submission.CalibrationId) {
      return <Badge variant="secondary">Đang kiểm tra...</Badge>;
    }
    if (submission.hasScored) {
      return (
        <Badge variant="default" className="bg-green-500">Đã chấm</Badge>
      );
    }
    return <Badge variant="secondary">Chưa chấm</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const unscoredCount = submissions.filter((s) => !s.hasScored).length;

  if (loading && submissions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Bài mẫu Calibration</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Bài mẫu Calibration</h2>
          {unscoredCount > 0 && (
            <Badge variant="destructive">{unscoredCount} chưa chấm</Badge>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadSubmissions()}
          disabled={loading}
        >
          <Clock className="size-4" />
          Làm mới
        </Button>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Mục đích:</strong> Calibration giúp đảm bảo các Judge chấm
          điểm nhất quán. Mỗi bài mẫu sẽ được chấm bởi nhiều Judge và bạn sẽ
          không biết điểm của người khác cho đến khi hoàn thành.
        </p>
      </div>

      {/* Calibration List */}
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Chưa có bài mẫu Calibration</p>
            <p className="text-sm text-muted-foreground mt-1">
              Coordinator sẽ tạo bài mẫu để bạn thực hiện calibration
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {submissions.map((submission) => (
            <Card
              key={submission.CalibrationId}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">
                      {submission.CalibrationTitle}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {submission.RoundName || 'Không xác định'}
                    </CardDescription>
                  </div>
                  {getStatusIcon(submission)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{submission.EventName || '-'}</span>
                  <span>•</span>
                  <span>{formatDate(submission.SubmittedAt)}</span>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(submission)}

                  <Button
                    size="sm"
                    onClick={() => handleOpenScoring(submission)}
                    disabled={checkingMyScore === submission.CalibrationId}
                  >
                    {submission.hasScored ? (
                      <>
                        <Clock className="size-4" />
                        Cập nhật
                      </>
                    ) : (
                      <>
                        <Target className="size-4" />
                        Bắt đầu
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scoring Form Dialog */}
      {selectedSubmission && (
        <JudgeCalibrationScoringForm
          submission={selectedSubmission}
          open={scoringOpen}
          onOpenChange={setScoringOpen}
          onSuccess={handleScoreSuccess}
        />
      )}
    </div>
  );
}
