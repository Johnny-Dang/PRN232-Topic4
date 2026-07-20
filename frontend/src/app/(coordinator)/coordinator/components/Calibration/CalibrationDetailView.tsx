'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, GitBranch, Globe, Presentation } from 'lucide-react';
import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalibrationScoreOutput,
  CalibrationSubmission,
  getCalibrationScores,
} from '@/lib/api';

interface CalibrationDetailViewProps {
  submission: CalibrationSubmission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JudgeScores {
  judgeCode: string;
  scores: CalibrationScoreOutput[];
}

export default function CalibrationDetailView({
  submission,
  open,
  onOpenChange,
}: CalibrationDetailViewProps) {
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<CalibrationScoreOutput[]>([]);

  useEffect(() => {
    if (open && submission.CalibrationId) {
      loadScores();
    }
  }, [open, submission.CalibrationId]);

  const loadScores = async () => {
    setLoading(true);
    try {
      const data = await getCalibrationScores(submission.CalibrationId);
      setScores(data.scores);
    } catch (error) {
      console.error('Failed to load scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedByJudge = scores.reduce<Record<string, JudgeScores>>(
    (acc, score) => {
      if (!acc[score.JudgeCode]) {
        acc[score.JudgeCode] = { judgeCode: score.JudgeCode, scores: [] };
      }
      acc[score.JudgeCode].scores.push(score);
      return acc;
    },
    {}
  );

  const judgeList = Object.values(groupedByJudge);

  const getUniqueCriteria = () => {
    const criteriaMap = new Map<string, string>();
    scores.forEach((score) => {
      if (!criteriaMap.has(score.CriteriaId)) {
        criteriaMap.set(score.CriteriaId, score.CriteriaName);
      }
    });
    return Array.from(criteriaMap.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  };

  const criteria = getUniqueCriteria();

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

  const getScoreForJudge = (judgeCode: string, criteriaId: string) => {
    return scores.find(
      (s) => s.JudgeCode === judgeCode && s.CriteriaId === criteriaId
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {submission.CalibrationTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Submission Info */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Sự kiện</Label>
                </div>
                <p className="font-medium">
                  {submission.EventName || 'Không xác định'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Vòng thi</Label>
                </div>
                <p className="font-medium">
                  {submission.RoundName || 'Không xác định'}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                </div>
                <p>{formatDate(submission.SubmittedAt)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-muted-foreground">Trạng thái</Label>
                </div>
                <Badge variant="secondary">{submission.Status}</Badge>
              </div>
            </div>
          </div>

          {/* URLs */}
          {(submission.RepositoryURL || submission.DemoURL || submission.SlideURL) && (
            <div className="space-y-3">
              <Label className="text-muted-foreground">Liên kết</Label>
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

          {/* Scores Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">
                Điểm của các Judge
              </Label>
              <Badge variant="secondary">
                {judgeList.length} Judge(s)
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : scores.length === 0 ? (
              <div className="rounded-lg border border-dashed py-8 text-center">
                <p className="text-muted-foreground">
                  Chưa có điểm nào được chấm
                </p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          Criteria
                        </th>
                        {judgeList.map((judge) => (
                          <th
                            key={judge.judgeCode}
                            className="px-4 py-3 text-center font-medium"
                          >
                            {judge.judgeCode}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map((c, index) => (
                        <tr
                          key={c.id}
                          className={
                            index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                          }
                        >
                          <td className="px-4 py-2.5 font-medium">{c.name}</td>
                          {judgeList.map((judge) => {
                            const score = getScoreForJudge(
                              judge.judgeCode,
                              c.id
                            );
                            return (
                              <td
                                key={judge.judgeCode}
                                className="px-4 py-2.5 text-center"
                              >
                                {score ? (
                                  <div className="flex flex-col items-center">
                                    <span className="font-medium">
                                      {score.ScoreValue}
                                    </span>
                                    {score.Comment && (
                                      <span className="max-w-[100px] truncate text-xs text-muted-foreground">
                                        {score.Comment}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
