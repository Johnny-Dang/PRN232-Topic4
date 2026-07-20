'use client';

import React from 'react';
import { Users, Calendar, Briefcase, Send, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TeamRecruitment } from '@/services/types/recruitment';

interface RecruitmentCardProps {
  recruitment: TeamRecruitment;
  onApply?: (recruitment: TeamRecruitment) => void;
  isOwner?: boolean;
  hasApplied?: boolean;
  onCloseRecruitment?: (recruitmentId: string) => void;
}

export default function RecruitmentCard({
  recruitment,
  onApply,
  isOwner = false,
  hasApplied = false,
  onCloseRecruitment,
}: RecruitmentCardProps) {
  const isOpen = recruitment.Status?.toUpperCase() === 'OPEN';

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 mb-2 font-medium"
              >
                <Briefcase className="w-3 h-3 mr-1" />
                {recruitment.RoleNeeded}
              </Badge>
              {hasApplied && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 mb-2 font-medium"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Đã ứng tuyển
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {recruitment.TeamName}
            </CardTitle>
          </div>
          <Badge
            variant={isOpen ? 'default' : 'secondary'}
            className={
              isOpen
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400 font-normal'
            }
          >
            {isOpen ? 'Đang tuyển' : 'Đã đóng'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
          {recruitment.Description}
        </p>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cần tuyển: <strong>{recruitment.Quantity}</strong> người</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(recruitment.CreatedAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
        {isOwner ? (
          isOpen && onCloseRecruitment ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCloseRecruitment(recruitment.RecruitmentId)}
              className="w-full text-slate-600 hover:text-red-600 border-slate-200 dark:border-slate-800 dark:text-slate-400 text-xs"
            >
              Đóng bài tuyển
            </Button>
          ) : (
            <Button
              disabled
              variant="secondary"
              size="sm"
              className="w-full bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 text-xs font-semibold"
            >
              Đội của bạn (Không thể ứng tuyển)
            </Button>
          )
        ) : hasApplied ? (
          <Button
            disabled
            variant="secondary"
            size="sm"
            className="w-full bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800 text-xs font-semibold"
          >
            ✓ Đã ứng tuyển
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={!isOpen}
            onClick={() => onApply?.(recruitment)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" /> Ứng tuyển ngay
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
