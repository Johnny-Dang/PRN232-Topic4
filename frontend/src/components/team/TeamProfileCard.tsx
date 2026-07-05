import React from 'react';
import { Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Category as ApiCategory, Event as ApiEvent, Team, TeamMember, User, StudentProfile } from '@/lib/api';

type TeamMemberWithProfile = TeamMember & {
  User: User;
  StudentProfile?: StudentProfile;
};

interface TeamProfileCardProps {
  team: Team;
  category: ApiCategory | null;
  event: ApiEvent | null;
  members: TeamMemberWithProfile[];
  allCategories: ApiCategory[];
  allEvents: ApiEvent[];
  isLeader: boolean;
  tempCategoryName: string;
  setTempCategoryName: (val: string) => void;
  registeringCat: boolean;
  selectedCategoryId: string;
  setSelectedCategoryId: (val: string) => void;
  registerCatSuccess: string;
  registerCatError: string;
  onRegisterCategory: (categoryId: string, eventId: string) => void;
}

const isEventOpenForRegistration = (ev: ApiEvent): boolean => {
  const now = Date.now();
  const startTime = new Date(ev.StartDate).getTime();

  return ev.IsPublished === true
    && ev.Status === 'Published'
    && Number.isFinite(startTime)
    && now < startTime;
};

export const TeamProfileCard: React.FC<TeamProfileCardProps> = ({
  team,
  category,
  event,
  members,
  allCategories,
  allEvents,
  isLeader,
  tempCategoryName,
  setTempCategoryName,
  registeringCat,
  selectedCategoryId,
  setSelectedCategoryId,
  registerCatSuccess,
  registerCatError,
  onRegisterCategory,
}) => {
  return (
    <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Bookmark className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Hồ sơ nhóm dự thi
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Hồ sơ đăng ký chính thức lấy từ API.
            </CardDescription>
          </div>
          <Badge className="border border-emerald-100 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
            {team.TeamStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6 pt-0">
        <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tên đội
            </span>
            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              {team.TeamName}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Hạng mục
            </span>
            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              {category?.CategoryName || 'Chưa đăng ký'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sự kiện chính
            </span>
            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              {event?.EventName || 'Chưa có'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trạng thái đội
            </span>
            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">
              {team.TeamStatus}
            </p>
          </div>
        </div>

        {!team.CategoryID && (
          <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Đăng ký Hạng mục & Sự kiện Thi đấu
            </h4>
            {members.length < 3 ? (
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-[11px] font-medium text-amber-700">
                Bạn cần thêm ít nhất 3 thành viên (bao gồm cả trưởng nhóm) để đăng ký hạng mục thi đấu. Hiện tại nhóm mới có {members.length} thành viên.
              </div>
            ) : (
              <>
                {isLeader ? (
                  <div className="space-y-4">
                    {!tempCategoryName ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-450 uppercase block">
                          Chọn hạng mục chuyên môn (Category)
                        </label>
                        <select
                          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                          onChange={(e) => setTempCategoryName(e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>-- Chọn hạng mục thi đấu --</option>
                          {Array.from(new Set(allCategories.map((c) => c.CategoryName))).map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-200">
                            Hạng mục đã chọn: <span className="text-indigo-600 font-extrabold">{tempCategoryName}</span>
                          </span>
                          <button
                            type="button"
                            className="text-[10px] font-bold text-slate-500 hover:text-rose-650 underline"
                            onClick={() => setTempCategoryName('')}
                          >
                            Chọn hạng mục khác
                          </button>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-semibold text-slate-450 uppercase block">
                            Chọn sự kiện đang mở đăng ký để tham gia
                          </label>

                          {allCategories.filter((c) => {
                            const ev = allEvents.find((e) => e.EventID === c.EventID);
                            return c.CategoryName === tempCategoryName && Boolean(ev && isEventOpenForRegistration(ev));
                          }).length === 0 && (
                            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-[11px] font-medium text-amber-700">
                              Chưa có sự kiện nào đang mở đăng ký cho hạng mục này.
                            </div>
                          )}

                          {allCategories
                            .filter((c) => {
                              const ev = allEvents.find((e) => e.EventID === c.EventID);
                              return c.CategoryName === tempCategoryName && Boolean(ev && isEventOpenForRegistration(ev));
                            })
                            .map((c) => {
                              const ev = allEvents.find((e) => e.EventID === c.EventID);
                              if (!ev) return null;

                              const isExpired = new Date() > new Date(ev.StartDate);

                              return (
                                <div
                                  key={c.CategoryID}
                                  className="rounded-xl border border-slate-150 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                  <div className="space-y-1">
                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                      {ev.EventName}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                      Mùa giải: {ev.Season} {ev.Year} | Thời gian: {new Date(ev.StartDate).toLocaleDateString()} - {new Date(ev.EndDate).toLocaleDateString()}
                                    </p>
                                    {ev.Description && (
                                      <p className="text-[10px] text-slate-400 italic line-clamp-1">
                                        {ev.Description}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    disabled={registeringCat || isExpired}
                                    className="h-8 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-750 text-white text-[11px] font-bold"
                                    onClick={() => {
                                      setSelectedCategoryId(c.CategoryID);
                                      onRegisterCategory(c.CategoryID, ev.EventID);
                                    }}
                                  >
                                    {registeringCat && selectedCategoryId === c.CategoryID
                                      ? 'Đang đăng ký...'
                                      : isExpired
                                      ? 'Đã bắt đầu'
                                      : 'Đăng ký tham gia'}
                                  </Button>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {registerCatSuccess && (
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-2 text-[11px] font-medium text-emerald-700">
                        {registerCatSuccess}
                      </div>
                    )}
                    {registerCatError && (
                      <div className="rounded-lg border border-rose-100 bg-rose-50 p-2 text-[11px] font-medium text-rose-700">
                        {registerCatError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-[11px] font-medium text-slate-600 dark:bg-slate-900">
                    Chỉ Trưởng nhóm mới có quyền chọn và đăng ký sự kiện thi đấu cho đội.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
