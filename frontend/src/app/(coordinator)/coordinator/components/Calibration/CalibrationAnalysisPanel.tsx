'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  BarChart3,
  X,
} from 'lucide-react';
import { Loader2, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
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
  const getConsistencyColor = (label: string) => {
    switch (label) {
      case 'Harsher':
        return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700';
      case 'Lenient':
        return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700';
      default:
        return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700';
    }
  };

  const getVarianceLevel = (value: number) => {
    if (value > 2) return { color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', label: 'Cao' };
    if (value > 1) return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300', label: 'TB' };
    return { color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', label: 'Tốt' };
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1100px] !w-[95vw] !max-h-[90vh] !p-0 !gap-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/15 rounded-lg">
                <BarChart3 className="size-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Phân tích Calibration</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {submission.CalibrationTitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                  className="gap-1"
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="size-8"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-10 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Đang tải phân tích...</p>
            </div>
          </div>
        ) : !analysis ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
            <div className="p-4 bg-muted rounded-full mb-4">
              <AlertCircle className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium mb-2">Chưa có dữ liệu phân tích</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Cần ít nhất 1 judge chấm điểm calibration sample để xem phân tích inconsistency.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Overview Stats - 4 columns */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="size-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      Judges
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {analysis.JudgeCount}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="size-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                      Criteria
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {analysis.CriteriaCount}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                      Điểm TB
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatNumber(analysis.OverallMean, 1)}
                  </p>
                </div>

                <div className={`bg-gradient-to-br rounded-xl p-5 border ${
                  analysis.InconsistencyFlags.length > 0
                    ? 'from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800'
                    : 'from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`size-4 ${
                      analysis.InconsistencyFlags.length > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`} />
                    <span className={`text-xs font-semibold uppercase tracking-wide ${
                      analysis.InconsistencyFlags.length > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      Cảnh báo
                    </span>
                  </div>
                  <p className={`text-3xl font-bold ${
                    analysis.InconsistencyFlags.length > 0
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {analysis.InconsistencyFlags.length}
                  </p>
                </div>
              </div>

              {/* Criteria Variance Table - Full Width */}
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b bg-muted/30">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <BarChart3 className="size-4 text-primary" />
                    Phương sai theo Criteria
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Criteria</th>
                      <th className="px-4 py-3 text-center font-semibold">Điểm TB</th>
                      <th className="px-4 py-3 text-center font-semibold">Min</th>
                      <th className="px-4 py-3 text-center font-semibold">Max</th>
                      <th className="px-4 py-3 text-center font-semibold">Range</th>
                      <th className="px-4 py-3 text-center font-semibold">Std Dev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.CriteriaVariance.map((cv, index) => {
                      const rangeLevel = getVarianceLevel(cv.ScoreRange);
                      const stdLevel = getVarianceLevel(cv.StandardDeviation);
                      return (
                        <tr
                          key={cv.CriteriaId}
                          className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                        >
                          <td className="px-5 py-3.5 font-medium">{cv.CriteriaName}</td>
                          <td className="px-4 py-3.5 text-center font-mono font-semibold">
                            {formatNumber(cv.MeanScore, 2)}
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono text-muted-foreground">
                            {formatNumber(cv.MinScore, 1)}
                          </td>
                          <td className="px-4 py-3.5 text-center font-mono text-muted-foreground">
                            {formatNumber(cv.MaxScore, 1)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${rangeLevel.color}`}>
                              {formatNumber(cv.ScoreRange, 2)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${stdLevel.color}`}>
                              {formatNumber(cv.StandardDeviation, 2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Judge Summary Table - Full Width */}
              <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b bg-muted/30">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    Tóm tắt theo Judge
                  </h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Judge</th>
                      <th className="px-4 py-3 text-center font-semibold">Điểm TB</th>
                      <th className="px-4 py-3 text-center font-semibold">Chênh lệch vs nhóm</th>
                      <th className="px-4 py-3 text-center font-semibold">Xu hướng chấm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.JudgeSummaries.map((js, index) => (
                      <tr
                        key={js.JudgeId}
                        className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                              {js.JudgeCode.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-semibold">{js.JudgeCode}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center font-mono font-semibold">
                          {formatNumber(js.AverageScore, 2)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`font-mono font-semibold ${
                              js.DeviationFromGroupMean > 0.5
                                ? 'text-blue-600 dark:text-blue-400'
                                : js.DeviationFromGroupMean < -0.5
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {js.DeviationFromGroupMean > 0 ? '+' : ''}
                            {formatNumber(js.DeviationFromGroupMean, 2)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${getConsistencyColor(js.ConsistencyLabel)}`}>
                            {js.ConsistencyLabel === 'Harsher' && <TrendingDown className="size-3.5" />}
                            {js.ConsistencyLabel === 'Lenient' && <TrendingUp className="size-3.5" />}
                            {js.ConsistencyLabel === 'Consistent' && <CheckCircle2 className="size-3.5" />}
                            {js.ConsistencyLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inconsistency Flags */}
              {analysis.InconsistencyFlags.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-800 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-yellow-300 dark:border-yellow-800 bg-yellow-100/50 dark:bg-yellow-900/30">
                    <h3 className="font-semibold text-base text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                      <AlertTriangle className="size-5" />
                      Cảnh báo Inconsistency ({analysis.InconsistencyFlags.length})
                    </h3>
                  </div>
                  <div className="p-5 space-y-2">
                    {analysis.InconsistencyFlags.map((flag, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 bg-white dark:bg-background rounded-lg p-3.5 border border-yellow-200 dark:border-yellow-900/50"
                      >
                        <AlertTriangle className="size-4 text-yellow-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-yellow-900 dark:text-yellow-200">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.InconsistencyFlags.length === 0 && analysis.JudgeCount > 1 && (
                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border-2 border-green-300 dark:border-green-800 p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                      <CheckCircle2 className="size-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200 text-base">
                        Tất cả Judges nhất quán
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">
                        Không có cảnh báo inconsistency nào được phát hiện trong calibration này.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}