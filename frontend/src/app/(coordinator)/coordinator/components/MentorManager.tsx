'use client';

import React, { useMemo, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAssignmentStatusClass } from './helpers';
import type { CoordinatorCategory, CoordinatorMentorAssignment, CoordinatorMentorUser } from './types';

interface MentorManagerProps {
  mentors: CoordinatorMentorUser[];
  categories: CoordinatorCategory[];
  assignments: CoordinatorMentorAssignment[];
}

export default function MentorManager({ mentors, categories, assignments }: MentorManagerProps) {
  const [search, setSearch] = useState('');
  const visibleMentors = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase();
    return mentors.filter((mentor) => !keyword
      || mentor.FullName.toLocaleLowerCase().includes(keyword)
      || mentor.Email.toLocaleLowerCase().includes(keyword)
      || mentor.ShortId.toLocaleLowerCase().includes(keyword));
  }, [mentors, search]);

  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-bold"><UserRound className="h-5 w-5 text-indigo-600" /> Quản lý Mentor</CardTitle>
        <CardDescription className="text-xs">Theo dõi thông tin Mentor và các Category được phân công.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên, email hoặc mã Mentor..." className="h-10 rounded-xl pl-9 text-xs" />
        </div>

        {visibleMentors.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">Không tìm thấy Mentor phù hợp.</p>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {visibleMentors.map((mentor) => {
              const mentorAssignments = assignments.filter((assignment) => assignment.UserId === mentor.UserId);
              return (
                <div key={mentor.UserId} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{mentor.FullName}</h3>
                      <p className="mt-1 truncate text-xs text-slate-500">{mentor.Email}</p>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Mã: {mentor.ShortId || 'Chưa cập nhật'} · {mentor.AccountStatus}</p>
                    </div>
                    <Badge className="border border-indigo-100 bg-indigo-50 text-[9px] font-extrabold text-indigo-700">{mentorAssignments.length} Category</Badge>
                  </div>
                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category phụ trách</div>
                    {mentorAssignments.length === 0 ? (
                      <p className="text-xs text-slate-500">Chưa có Category được phân công.</p>
                    ) : mentorAssignments.map((assignment) => {
                      const category = categories.find((item) => item.CategoryId === assignment.CategoryId);
                      return (
                        <div key={assignment.CategoryMentorId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-900">
                          <span className="truncate font-semibold text-slate-700 dark:text-slate-200">{assignment.CategoryName || category?.CategoryName || assignment.CategoryId}</span>
                          <Badge className={`shrink-0 border text-[9px] font-extrabold ${getAssignmentStatusClass(assignment.Status)}`}>{assignment.Status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
