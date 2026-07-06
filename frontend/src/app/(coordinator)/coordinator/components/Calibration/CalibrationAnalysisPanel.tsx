'use client';

import { AlertCircle, AlertTriangle, Target, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { Loader2, RefreshCw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { CalibrationAnalysis, CalibrationSubmission } from '@/lib/api';

interface CalibrationAnalysisPanelProps {
  submission: CalibrationSubmission;
  analysis: CalibrationAnalysis | null;
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

export default function CalibrationAnalysisPanel({
  submission,
  analysis,
  loading,
  open,
  onOpenChange,
  onRefresh,
}: CalibrationAnalysisPanelProps) {
  const getConsistencyIcon = (label: string) => {
    switch (label) {
      case 'Harsher':
        return <TrendingDown className="size-4 text-red-500" />;
      case 'Lenient':
        return <TrendingUp className="size-4 text-green-500" />;
      default:
        return <Users className="size-4 text-muted-foreground" />;
    }
  };

  const getConsistencyBadgeVariant = (label: string) => {
    switch (label) {
      case 'Harsher':
        return 'destructive';
      case 'Lenient':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 2) return 'text-red-500';
    if (variance > 1) return 'text-yellow-500';
    return 'text-green-500';
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Phân tích Calibration
            </DialogTitle>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className="size-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {submission.CalibrationTitle}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : !analysis ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="size-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Không có dữ liệu phân tích</p>
            <p className="text-sm text-muted-foreground mt-1">
              Cần ít nhất 1 judge chấm để xem phân tích
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="size-4" />
                  <span className="text-xs uppercase tracking-wide">
                    Judges
                  </span>
                </div>
                <p className="text-2xl font-bold">{analysis.JudgeCount}</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="size-4" />
                  <span className="text-xs uppercase tracking-wide">
                    Criteria
                  </span>
                </div>
                <p className="text-2xl font-bold">{analysis.CriteriaCount}</p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="text-xs uppercase tracking-wide">
                    Điểm TB
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber(analysis.OverallMean)}
                </p>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <AlertTriangle className="size-4" />
                  <span className="text-xs uppercase tracking-wide">
                    Cảnh báo
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  {analysis.InconsistencyFlags.length}
                </p>
              </div>
            </div>

            {/* Criteria Variance Table */}
            <div className="space-y-3">
              <Label>Phương sai theo Criteria</Label>
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          Criteria
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Điểm TB
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Min
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Max
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Range
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Std Dev
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.CriteriaVariance.map((cv, index) => (
                        <tr
                          key={cv.CriteriaId}
                          className={
                            index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                          }
                        >
                          <td className="px-4 py-2.5 font-medium">
                            {cv.CriteriaName}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {formatNumber(cv.MeanScore)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {formatNumber(cv.MinScore)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {formatNumber(cv.MaxScore)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge
                              variant="secondary"
                              className={getVarianceColor(cv.ScoreRange)}
                            >
                              {formatNumber(cv.ScoreRange)}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge
                              variant="secondary"
                              className={getVarianceColor(cv.StandardDeviation)}
                            >
                              {formatNumber(cv.StandardDeviation)}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Judge Summary Table */}
            <div className="space-y-3">
              <Label>Tóm tắt Judge</Label>
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          Judge
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Điểm TB
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Chênh lệch
                        </th>
                        <th className="px-4 py-3 text-center font-medium">
                          Xu hướng
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.JudgeSummaries.map((js, index) => (
                        <tr
                          key={js.JudgeId}
                          className={
                            index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                          }
                        >
                          <td className="px-4 py-2.5 font-medium">
                            {js.JudgeCode}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {formatNumber(js.AverageScore)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span
                              className={
                                js.DeviationFromGroupMean > 0
                                  ? 'text-green-600'
                                  : js.DeviationFromGroupMean < 0
                                  ? 'text-red-600'
                                  : 'text-muted-foreground'
                              }
                            >
                              {js.DeviationFromGroupMean > 0 ? '+' : ''}
                              {formatNumber(js.DeviationFromGroupMean)}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <Badge
                              variant={getConsistencyBadgeVariant(js.ConsistencyLabel) as any}
                              className="gap-1"
                            >
                              {getConsistencyIcon(js.ConsistencyLabel)}
                              {js.ConsistencyLabel}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Inconsistency Flags */}
            {analysis.InconsistencyFlags.length > 0 && (
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="size-4" />
                  Cảnh báo Inconsistency
                </Label>
                <div className="space-y-2">
                  {analysis.InconsistencyFlags.map((flag, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900/50 dark:bg-yellow-900/20"
                    >
                      <AlertTriangle className="size-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
