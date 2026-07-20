'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Globe,
  Presentation,
  Target,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalibrationScoreInput,
  CalibrationScoreOutput,
  CalibrationSubmission,
  getMyCalibrationScore,
  submitCalibrationScore,
  updateCalibrationScore,
  getCalibrationScores,
  getEventCriteria,
} from '@/lib/api';

interface JudgeCalibrationScoringFormProps {
  submission: CalibrationSubmission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ScoreFormData {
  criteriaId: string;
  criteriaName: string;
  scoreValue: number;
  comment: string;
  minScore: number;
  maxScore: number;
}

export default function JudgeCalibrationScoringForm({
  submission,
  open,
  onOpenChange,
  onSuccess,
}: JudgeCalibrationScoringFormProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ScoreFormData[]>([]);
  const [existingScores, setExistingScores] = useState<CalibrationScoreOutput[]>([]);
  const [hasExistingScores, setHasExistingScores] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    setErrors({});

    try {
      // Get criteria from API or use default
      let criteriaData: ScoreFormData[] = [];
      
      if (submission.EventId) {
        try {
          const criteriaResult = await getEventCriteria(submission.EventId);
          criteriaData = criteriaResult.map((criteria) => ({
            criteriaId: criteria.CriteriaID,
            criteriaName: criteria.CriteriaName,
            scoreValue: 0,
            comment: '',
            minScore: 0,
            maxScore: 10,
          }));
        } catch (e) {
          console.warn('Failed to load criteria from API:', e);
        }
      }

      // Fallback to default if no criteria from API
      const defaultFormData = criteriaData.length > 0 ? criteriaData : getDefaultFormData();

      const [myScoreResult] = await Promise.all([
        getMyCalibrationScore(submission.CalibrationId),
      ]);

      setExistingScores(myScoreResult.scores);
      setHasExistingScores(myScoreResult.hasScored);

      if (myScoreResult.hasScored && myScoreResult.scores.length > 0) {
        const mapped = defaultFormData.map((item) => {
          const existing = myScoreResult.scores.find(
            (s) => s.CriteriaId === item.criteriaId
          );
          return existing
            ? {
                ...item,
                scoreValue: existing.ScoreValue,
                comment: existing.Comment || '',
              }
            : item;
        });
        setFormData(mapped);
      } else {
        setFormData(defaultFormData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFormData = (): ScoreFormData[] => {
    return [
      { criteriaId: 'criteria-1', criteriaName: 'Tính đúng đắn (Correctness)', scoreValue: 0, comment: '', minScore: 0, maxScore: 10 },
      { criteriaId: 'criteria-2', criteriaName: 'Chức năng (Functionality)', scoreValue: 0, comment: '', minScore: 0, maxScore: 10 },
      { criteriaId: 'criteria-3', criteriaName: 'Giao diện (UI/UX)', scoreValue: 0, comment: '', minScore: 0, maxScore: 10 },
      { criteriaId: 'criteria-4', criteriaName: 'Code chất lượng (Code Quality)', scoreValue: 0, comment: '', minScore: 0, maxScore: 10 },
      { criteriaId: 'criteria-5', criteriaName: 'Trình bày (Presentation)', scoreValue: 0, comment: '', minScore: 0, maxScore: 10 },
    ];
  };

  const handleScoreChange = (criteriaId: string, value: number) => {
    setFormData((prev) =>
      prev.map((item) =>
        item.criteriaId === criteriaId ? { ...item, scoreValue: value } : item
      )
    );

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[criteriaId];
      return newErrors;
    });
  };

  const handleCommentChange = (criteriaId: string, comment: string) => {
    setFormData((prev) =>
      prev.map((item) =>
        item.criteriaId === criteriaId ? { ...item, comment } : item
      )
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    formData.forEach((item) => {
      if (item.scoreValue < item.minScore || item.scoreValue > item.maxScore) {
        newErrors[item.criteriaId] = `Điểm phải từ ${item.minScore} đến ${item.maxScore}`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại điểm số');
      return;
    }

    const scores: CalibrationScoreInput[] = formData.map((item) => ({
      CriteriaId: item.criteriaId,
      ScoreValue: item.scoreValue,
      Comment: item.comment,
    }));

    setSubmitting(true);

    try {
      if (hasExistingScores) {
        await updateCalibrationScore(submission.CalibrationId, scores);
        toast.success('Đã cập nhật điểm calibration thành công!');
      } else {
        await submitCalibrationScore(submission.CalibrationId, scores);
        toast.success('Đã nộp điểm calibration thành công!');
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to submit scores:', error);
      toast.error('Không thể lưu điểm. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return formData.reduce((sum, item) => sum + item.scoreValue, 0);
  };

  const calculateMaxTotal = () => {
    return formData.reduce((sum, item) => sum + item.maxScore, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            {hasExistingScores ? 'Cập nhật' : 'Chấm điểm'} Calibration
          </DialogTitle>
          <DialogDescription>
            {submission.CalibrationTitle}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* URLs Section */}
            {(submission.RepositoryURL || submission.DemoURL || submission.SlideURL) && (
              <div className="space-y-3">
                <Label className="text-muted-foreground">Tài nguyên</Label>
                <div className="flex flex-wrap gap-2">
                  {submission.RepositoryURL && (
                    <a
                      href={submission.RepositoryURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                    >
                      <GitBranch className="size-4" />
                      Repository
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  {submission.DemoURL && (
                    <a
                      href={submission.DemoURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Globe className="size-4" />
                      Demo
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                  {submission.SlideURL && (
                    <a
                      href={submission.SlideURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Presentation className="size-4" />
                      Slide
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Scoring Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Điểm theo tiêu chí</Label>
                <div className="text-sm">
                  Tổng: <span className="font-semibold">{calculateTotal()}</span>
                  <span className="text-muted-foreground">/{calculateMaxTotal()}</span>
                </div>
              </div>

              {formData.map((item) => (
                <div key={item.criteriaId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={item.criteriaId} className="text-sm font-medium">
                      {item.criteriaName}
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      ({item.minScore} - {item.maxScore})
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={item.minScore}
                      max={item.maxScore}
                      step={0.5}
                      value={item.scoreValue}
                      onChange={(e) =>
                        handleScoreChange(item.criteriaId, parseFloat(e.target.value))
                      }
                      className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />

                    <div className="w-16">
                      <input
                        type="number"
                        min={item.minScore}
                        max={item.maxScore}
                        step={0.5}
                        value={item.scoreValue}
                        onChange={(e) =>
                          handleScoreChange(
                            item.criteriaId,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full h-8 px-2 text-center rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                  </div>

                  {errors[item.criteriaId] && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="size-3" />
                      {errors[item.criteriaId]}
                    </p>
                  )}

                  <input
                    type="text"
                    placeholder="Nhận xét (tùy chọn)..."
                    value={item.comment}
                    onChange={(e) =>
                      handleCommentChange(item.criteriaId, e.target.value)
                    }
                    className="w-full h-8 px-3 text-sm rounded-lg border border-input bg-background"
                  />
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
              <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                Hướng dẫn chấm điểm
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                <li>Chấm điểm dựa trên chất lượng thực tế của sản phẩm</li>
                <li>Điểm số phải phản ánh đúng năng lực của team</li>
                <li>Không trao đổi điểm với các Judge khác</li>
                <li>Có thể cập nhật điểm trước deadline</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : hasExistingScores ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    Cập nhật điểm
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Nộp điểm
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
