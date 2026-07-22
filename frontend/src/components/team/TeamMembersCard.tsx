import React from 'react';
import { Users, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Team, TeamMember, User, StudentProfile } from '@/lib/api';

type TeamMemberWithProfile = TeamMember & {
  User: User;
  StudentProfile?: StudentProfile;
};

interface TeamMembersCardProps {
  team: Team;
  members: TeamMemberWithProfile[];
  isLeader: boolean;
  newMemberId: string;
  setNewMemberId: (val: string) => void;
  addingMember: boolean;
  addErrorMessage: string;
  addSuccessMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onRemoveMember?: (teamMemberId: string) => Promise<void>;
}

export const TeamMembersCard: React.FC<TeamMembersCardProps> = ({
  team,
  members,
  isLeader,
  newMemberId,
  setNewMemberId,
  addingMember,
  addErrorMessage,
  addSuccessMessage,
  onSubmit,
  onRemoveMember,
}) => {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold">
          <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Thành viên nhóm ({members.length})
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-400">
          Thành viên lấy từ API team members nếu backend có hỗ trợ.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-6 pt-0">
        {members.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-950">
            Không tìm thấy thành viên trong nhóm.
          </div>
        ) : (
          members.map((member) => {
            const isFpt = member.StudentProfile?.StudentType === 'FPT';
            const isMemberLeader = member.User?.UserID === team.TeamLeaderId || member.UserId === team.TeamLeaderId;
            return (
              <div
                key={member.TeamMemberId}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {member.User.FullName}
                    </span>
                    {isMemberLeader && (
                      <Badge className="bg-indigo-600 px-1.5 py-0 text-[8px] font-bold text-white">Lead</Badge>
                    )}
                  </div>
                  <p className="text-[9px] font-semibold uppercase text-slate-400">
                    {member.User.Email || member.StudentProfile?.UniversityName || 'Đại học'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1 text-right">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {member.User.ShortId || member.StudentProfile?.StudentCode || '-'}
                    </span>
                    <Badge className="border border-blue-100 bg-blue-50 text-[8px] font-extrabold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      {isFpt ? 'SINH VIÊN FPT' : 'SINH VIÊN NGOÀI'}
                    </Badge>
                  </div>
                  {isLeader && onRemoveMember && !isMemberLeader && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      title="Xóa thành viên khỏi nhóm"
                      className="h-8 w-8 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                      onClick={async () => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${member.User.FullName}" khỏi nhóm?`)) {
                          try {
                            await onRemoveMember(member.TeamMemberId);
                          } catch (err: unknown) {
                            const axiosError = err as { response?: { data?: { message?: string } } };
                            const msg = axiosError.response?.data?.message || (err instanceof Error ? err.message : '') || 'Không thể xóa thành viên.';
                            alert(msg);
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLeader && team && (
          <div className="mt-6 space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Thêm thành viên mới
            </h5>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase text-slate-400">
                  Email, mã thành viên hoặc mã sinh viên
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập email, mã hệ thống hoặc mã sinh viên (VD: an@example.com, TM0001, SE170002)"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                />
              </div>
              {addSuccessMessage && (
                <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-[11px] font-medium text-emerald-700">
                  {addSuccessMessage}
                </div>
              )}
              {addErrorMessage && (
                <div className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-[11px] font-medium text-rose-700">
                  {addErrorMessage}
                </div>
              )}
              <Button
                type="submit"
                disabled={addingMember || !newMemberId.trim()}
                className="h-9 w-full rounded-lg bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700"
              >
                {addingMember ? 'Đang thêm...' : 'Thêm vào nhóm'}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
