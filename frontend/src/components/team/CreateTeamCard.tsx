import React from 'react';
import { Button } from '@/components/ui/button';

interface CreateTeamCardProps {
  newTeamName: string;
  setNewTeamName: (val: string) => void;
  firstMemberId: string;
  setFirstMemberId: (val: string) => void;
  creatingTeam: boolean;
  createTeamError: string;
  createTeamSuccess: string;
  onSubmit: (e: React.FormEvent) => void;
}

export const CreateTeamCard: React.FC<CreateTeamCardProps> = ({
  newTeamName,
  setNewTeamName,
  firstMemberId,
  setFirstMemberId,
  creatingTeam,
  createTeamError,
  createTeamSuccess,
  onSubmit,
}) => {
  return (
    <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-3">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Thành lập nhóm mới
      </h4>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-450 uppercase">
            Tên nhóm dự thi
          </label>
          <input
            type="text"
            required
            placeholder="Nhập tên nhóm (Từ 2 đến 120 ký tự)"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-455 uppercase">
            Email hoặc mã thành viên
          </label>
          <input
            type="text"
            required
            placeholder="Nhập email hoặc mã 6 ký tự (VD: an@example.com, fcea02)"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            value={firstMemberId}
            onChange={(e) => setFirstMemberId(e.target.value)}
          />
        </div>
        {createTeamSuccess && (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-[11px] font-medium text-emerald-700">
            {createTeamSuccess}
          </div>
        )}
        {createTeamError && (
          <div className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-[11px] font-medium text-rose-700">
            {createTeamError}
          </div>
        )}
        <Button
          type="submit"
          disabled={creatingTeam || !newTeamName.trim() || !firstMemberId.trim()}
          className="h-9 px-4 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700"
        >
          {creatingTeam ? 'Đang tạo nhóm...' : 'Tạo nhóm và thêm thành viên'}
        </Button>
      </form>
    </div>
  );
};
