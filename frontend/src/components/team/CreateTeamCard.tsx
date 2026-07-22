import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

interface TeamMemberWithProfile {
  TeamMemberId: string;
  TeamID: string;
  UserId: string;
  User: {
    UserID: string;
    FullName: string;
    ShortId: string;
  };
  StudentProfile?: {
    StudentCode: string;
    UniversityName: string;
  };
}

interface OldTeam {
  TeamID: string;
  TeamName: string;
  members: TeamMemberWithProfile[];
}

interface CreateTeamCardProps {
  newTeamName: string;
  setNewTeamName: (val: string) => void;
  creatingTeam: boolean;
  createTeamError: string;
  createTeamSuccess: string;
  onSubmit: (e: React.FormEvent) => void;
  oldTeams?: OldTeam[];
  currentUserId?: string;
}

export const CreateTeamCard: React.FC<CreateTeamCardProps> = ({
  newTeamName,
  setNewTeamName,
  creatingTeam,
  createTeamError,
  createTeamSuccess,
  onSubmit,
  oldTeams = [],
}) => {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const toggleExpand = (teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  return (
    <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-4">
      {oldTeams.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" /> Chọn tên từ Team cũ của bạn
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Bấm "Dùng tên này" để điền nhanh tên nhóm. Tạo nhóm mới sẽ chỉ khởi tạo với Trưởng nhóm (Team cũ giữ nguyên 100%).
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {oldTeams.map((team) => {
              const isExpanded = expandedTeams.has(team.TeamID);
              const isSelected = newTeamName === team.TeamName;
              return (
                <div
                  key={team.TeamID}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 dark:border-indigo-600 dark:bg-indigo-950/20'
                      : 'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {team.TeamName}
                      </span>
                      <Badge className="text-[8px] px-1.5 py-0.5 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {team.members.length} thành viên cũ
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => setNewTeamName(team.TeamName)}
                        className="h-7 text-[10px] font-bold px-2.5 rounded-lg"
                      >
                        {isSelected ? 'Đã chọn tên' : 'Dùng tên này'}
                      </Button>
                      <button
                        type="button"
                        onClick={() => toggleExpand(team.TeamID)}
                        className="p-1 hover:bg-slate-200/50 rounded-md transition-colors"
                        title="Xem danh sách thành viên lịch sử"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-white/50 dark:bg-slate-900/50">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">
                        Danh sách thành viên lịch sử (chỉ xem):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {team.members.map((member) => (
                          <div
                            key={member.TeamMemberId}
                            className="flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                                {member.User.FullName}
                              </p>
                              <p className="text-[9px] text-slate-400 truncate">
                                {member.StudentProfile?.StudentCode || member.User.ShortId || 'N/A'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase">
              <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-400">hoặc nhập tên mới</span>
            </div>
          </div>
        </div>
      )}

      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        Tạo team mới
      </h4>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-450 uppercase">
            Tên nhóm dự thi <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Nhập tên nhóm (VD: MenuGreen)"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
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
          disabled={creatingTeam || !newTeamName.trim()}
          className="h-9 px-4 rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700"
        >
          {creatingTeam ? 'Đang tạo nhóm...' : 'Tạo nhóm mới'}
        </Button>
      </form>
    </div>
  );
};
