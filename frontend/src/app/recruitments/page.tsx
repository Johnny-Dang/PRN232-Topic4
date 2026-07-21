'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, Briefcase, Filter, RefreshCw, Loader2, ArrowLeft, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RecruitmentCard from '@/components/recruitment/RecruitmentCard';
import ApplyModal from '@/components/application/ApplyModal';
import CreateRecruitmentModal from '@/components/recruitment/CreateRecruitmentModal';
import { getRecruitmentsApi } from '@/services/api/recruitment';
import { getTeams, getMyApplications } from '@/lib/api';
import { TeamRecruitment } from '@/services/types/recruitment';
import type { MyApplication } from '@/lib/api';

export default function RecruitmentsPage() {
  const router = useRouter();
  const [recruitments, setRecruitments] = useState<TeamRecruitment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [selectedRecruitment, setSelectedRecruitment] = useState<TeamRecruitment | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myApplications, setMyApplications] = useState<MyApplication[]>([]);

  const fetchRecruitments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecruitmentsApi({
        roleNeeded: roleFilter || undefined,
      });
      setRecruitments(data);
    } catch (err: unknown) {
      console.error('Lỗi lấy danh sách bài tuyển:', err);
      setError('Không thể tải danh sách bài tuyển dụng.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const [data, teams, applications] = await Promise.all([
          getRecruitmentsApi({ roleNeeded: roleFilter || undefined }),
          getTeams().catch(() => []),
          getMyApplications().catch(() => []),
        ]);
        if (isMounted) {
          setRecruitments(data);
          setMyApplications(applications);
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('seal_user');
            if (stored) {
              try {
                const parsed = JSON.parse(stored);
                const userId = parsed.UserID || parsed.UserId || parsed.userId;
                if (userId) {
                  const myTeam = teams.find(
                    (t) => t.TeamLeaderId?.toLowerCase() === userId.toLowerCase()
                  );
                  if (myTeam) setMyTeamId(myTeam.TeamID);
                }
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      } catch (err: unknown) {
        console.error('Lỗi lấy danh sách bài tuyển:', err);
        if (isMounted) setError('Không thể tải danh sách bài tuyển dụng.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [roleFilter]);

  const handleCreateRecruitmentClick = async () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('seal_user');
    if (!stored) {
      alert('Vui lòng đăng nhập để đăng tin tuyển dụng.');
      router.push('/login');
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      const userId = parsed.UserID || parsed.UserId || parsed.userId;
      if (!userId) {
        alert('Phiên đăng nhập không hợp lệ.');
        return;
      }

      const teams = await getTeams();
      const myTeam = teams.find(
        (t) => t.TeamLeaderId.toLowerCase() === userId.toLowerCase()
      );

      if (!myTeam) {
        alert(
          'Bạn chưa sở hữu Đội thi nào. Vui lòng tạo Đội thi với vai trò Trưởng nhóm để đăng tin tuyển thành viên!'
        );
        router.push('/leader');
        return;
      }

      setMyTeamId(myTeam.TeamID);
      setIsCreateModalOpen(true);
    } catch (err) {
      console.error('Lỗi kiểm tra thông tin đội:', err);
      alert('Không thể xác thực thông tin đội thi của bạn.');
    }
  };

  const filteredRecruitments = recruitments.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.TeamName.toLowerCase().includes(q) ||
      r.RoleNeeded.toLowerCase().includes(q) ||
      r.Description.toLowerCase().includes(q)
    );
  });

  const handleOpenApply = (recruitment: TeamRecruitment) => {
    setSelectedRecruitment(recruitment);
    setIsApplyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 space-y-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Trang chủ
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Sàn Ghép Nhóm & Tìm Đồng Đội
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Khám phá các đội thi đang tìm kiếm thành viên và gửi đơn ứng tuyển ngay hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateRecruitmentClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" /> Đăng tin tuyển dụng
          </Button>
          <Link href="/my-applications">
            <Button variant="outline" className="border-slate-200 dark:border-slate-800 text-xs">
              <Briefcase className="w-4 h-4 mr-1.5" /> Đơn đã nộp & Kỹ năng
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchRecruitments}
            title="Làm mới"
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhóm, vai trò hoặc từ khóa..."
              className="pl-9 bg-slate-50 dark:bg-slate-800/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <Input
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              placeholder="Lọc vai trò (VD: Frontend, Backend...)"
              className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
            {error}
          </div>
        )}

        {/* Recruitment List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : filteredRecruitments.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              Không tìm thấy tin tuyển dụng nào
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Thử tìm kiếm với từ khóa khác hoặc quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecruitments.map((recruitment) => (
              <RecruitmentCard
                key={recruitment.RecruitmentId}
                recruitment={recruitment}
                isOwner={!!myTeamId && myTeamId === recruitment.TeamId}
                hasApplied={myApplications.some(
                  (app) => app.RecruitmentId?.toLowerCase() === recruitment.RecruitmentId?.toLowerCase()
                )}
                onApply={handleOpenApply}
              />
            ))}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <ApplyModal
        recruitment={selectedRecruitment}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          alert('Đã gửi đơn ứng tuyển thành công!');
          fetchRecruitments();
        }}
      />

      {/* Create Recruitment Modal */}
      {myTeamId && (
        <CreateRecruitmentModal
          teamId={myTeamId}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            alert('Đã đăng tin tuyển dụng thành công!');
            fetchRecruitments();
          }}
        />
      )}
    </div>
  );
}
