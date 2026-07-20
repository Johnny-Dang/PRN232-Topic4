'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Award, Briefcase, CheckCircle, XCircle, ArrowLeft, RefreshCw, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ManageSkillsModal from '@/components/skills/ManageSkillsModal';
import { getMySkillsApi } from '@/services/api/skill';
import { getMyApplicationsApi } from '@/services/api/application';
import { UserSkill } from '@/services/types/skill';
import { TeamApplication } from '@/services/types/application';

export default function MyApplicationsPage() {
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(true);
  const [loadingApps, setLoadingApps] = useState<boolean>(true);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setLoadingSkills(true);
    try {
      const data = await getMySkillsApi();
      setSkills(data);
    } catch (err: unknown) {
      console.error('Lỗi lấy kỹ năng cá nhân:', err);
    } finally {
      setLoadingSkills(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoadingApps(true);
    try {
      const data = await getMyApplicationsApi();
      setApplications(data);
    } catch (err: unknown) {
      console.error('Lỗi lấy danh sách đơn ứng tuyển:', err);
      setError('Không thể tải danh sách đơn đã nộp.');
    } finally {
      setLoadingApps(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoadingSkills(true);
      setLoadingApps(true);
      try {
        const [skillsData, appsData] = await Promise.all([
          getMySkillsApi(),
          getMyApplicationsApi(),
        ]);
        if (isMounted) {
          setSkills(skillsData);
          setApplications(appsData);
        }
      } catch (err: unknown) {
        console.error('Lỗi lấy dữ liệu cá nhân:', err);
        if (isMounted) setError('Không thể tải dữ liệu đơn đã nộp.');
      } finally {
        if (isMounted) {
          setLoadingSkills(false);
          setLoadingApps(false);
        }
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'ACCEPTED' || status === 'Accepted') {
      return (
        <Badge className="bg-emerald-500 text-white font-medium">
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Được chấp nhận
        </Badge>
      );
    }
    if (status === 'REJECTED' || status === 'Rejected') {
      return (
        <Badge variant="destructive" className="font-medium">
          <XCircle className="w-3.5 h-3.5 mr-1" /> Đã bị từ chối
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800 font-medium">
        Đang chờ duyệt
      </Badge>
    );
  };

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/recruitments"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Sàn ghép nhóm
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Hồ sơ & Đơn Ứng Tuyển Đã Nộp
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý các kỹ năng cá nhân và theo dõi tiến độ xét duyệt các đơn gia nhập nhóm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              fetchSkills();
              fetchApplications();
            }}
            title="Làm mới"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Section 1: User Skills Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Hồ sơ Kỹ năng của bạn
              </CardTitle>
            </div>
            <Button
              size="sm"
              onClick={() => setIsSkillsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Quản lý kỹ năng
            </Button>
          </CardHeader>

          <CardContent>
            {loadingSkills ? (
              <div className="py-6 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : skills.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Bạn chưa thêm kỹ năng nào. Nhấn &quot;Quản lý kỹ năng&quot; để bổ sung hồ sơ.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill) => (
                  <Badge
                    key={skill.UserSkillId}
                    variant="outline"
                    className="bg-indigo-50/70 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800 py-1.5 px-3 text-xs font-medium"
                  >
                    <span className="font-semibold">{skill.Role}:</span>&nbsp;
                    {skill.SkillName}
                    {skill.ExperienceLevel && (
                      <span className="ml-1 opacity-75 text-[10px] uppercase font-bold">
                        ({skill.ExperienceLevel})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Submitted Applications List */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Danh sách Đơn Ứng Tuyển Đã Gửi ({applications.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200 mb-4 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
                {error}
              </div>
            )}

            {loadingApps ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Bạn chưa gửi đơn ứng tuyển nào.&nbsp;
                <Link
                  href="/recruitments"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Khám phá tin tuyển dụng ngay!
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.ApplicationId}
                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                          {app.TeamName}
                        </h4>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          Nộp ngày {formatDate(app.CreatedAt)}
                        </span>
                      </div>
                      {app.Message && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                          &quot;{app.Message}&quot;
                        </p>
                      )}
                    </div>

                    <div>{getStatusBadge(app.Status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills Modal */}
      <ManageSkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        onSuccess={() => {
          fetchSkills();
        }}
      />
    </div>
  );
}
