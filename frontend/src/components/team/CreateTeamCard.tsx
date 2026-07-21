import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

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
  onRemoveMember?: (teamId: string, teamMemberId: string) => Promise<void>;
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
  onRemoveMember,
}) => {
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState('');

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

  const handleRemoveMember = async (teamId: string, teamMemberId: string) => {
    if (!onRemoveMember) return;

    setRemovingMemberId(teamMemberId);
    setRemoveError('');
    try {
      await onRemoveMember(teamId, teamMemberId);
    } catch (err: unknown) {
      setRemoveError(err instanceof Error ? err.message : 'Không thể xóa thành viên');
    } finally {
      setRemovingMemberId(null);
    }
  };

      // isLeaderOfTeam is defined in parent components or not currently needed in render

  return (
    <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-4">
      {oldTeams.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4" /> Hoặc chọn team cũ để tham gia Event mới
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Bạn có thể chọn một team cũ để tham gia Event mới. Nếu cần, hãy xóa thành viên cũ và thêm thành viên mới.
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {oldTeams.map((team) => {
              const isExpanded = expandedTeams.has(team.TeamID);
              return (
                <div
                  key={team.TeamID}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(team.TeamID)}
                    className="w-full flex items-center justify-between p-3 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {team.TeamName}
                      </span>
                      <Badge className="text-[8px] px-1.5 py-0.5 bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {team.members.length} thành viên
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-2">
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">
                        Danh sách thành viên:
                      </p>
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
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(team.TeamID, member.TeamMemberId)}
                            disabled={removingMemberId === member.TeamMemberId}
                            className="shrink-0 p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-50"
                            title="Xóa thành viên"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                      {removeError && (
                        <p className="text-[10px] text-rose-600 font-medium">{removeError}</p>
                      )}
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
              <span className="bg-slate-50 dark:bg-slate-900 px-2 text-slate-400">hoặc</span>
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
