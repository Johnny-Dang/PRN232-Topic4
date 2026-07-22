'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Bookmark, CalendarDays, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getAdvancementRules,
  getCategories,
  getEvents,
  getRankings,
  getRounds,
  getTeamMembers,
  getTeams,
  addTeamMember,
  createTeam,
  setTeamCategory,
  removeTeamMember,
  Category as ApiCategory,
  Event as ApiEvent,
  Round as ApiRound,
  Team,
} from '@/lib/api';

import { CreateTeamCard } from '@/components/team/CreateTeamCard';
import { TeamProfileCard } from '@/components/team/TeamProfileCard';
import { TeamRoundsCard } from '@/components/team/TeamRoundsCard';
import { TeamMembersCard } from '@/components/team/TeamMembersCard';
import { useToast } from '@/contexts/ToastContext';

type TeamMemberWithProfile = Awaited<ReturnType<typeof getTeamMembers>>[number];
type RankingWithTeam = Awaited<ReturnType<typeof getRankings>>[number];
type AdvancementRuleData = Awaited<ReturnType<typeof getAdvancementRules>>[number];

const getStringProperty = (value: unknown, keys: string[]): string | null => {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const property = record[key];
    if (typeof property === 'string' && property.trim()) return property;
  }

  return null;
};

const getStoredUserId = (): string | null => {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem('seal_user');
  if (!storedUser) return null;

  try {
    return getStringProperty(JSON.parse(storedUser) as unknown, ['UserID', 'UserId', 'userId']);
  } catch (error) {
    console.error('Cannot parse seal_user from localStorage:', error);
    return null;
  }
};

const memberLookupRegex =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[^\s@]+@[^\s@]+\.[^\s@]+|[a-z0-9_-]{4,20})$/i;

const validateMemberLookup = (value: string) => memberLookupRegex.test(value.trim());

type OldTeamData = {
  TeamID: string;
  TeamName: string;
  members: TeamMemberWithProfile[];
};

type MyTeamEntry = {
  team: Team;
  members: TeamMemberWithProfile[];
  event: ApiEvent | null;
  category: ApiCategory | null;
  isLeader: boolean;
  isPending: boolean;
};

export default function MemberPage() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestedEventId = searchParams.get('eventId') ?? '';
  const forceNewTeam = searchParams.get('newTeam') === '1';
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithProfile[]>([]);
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [category, setCategory] = useState<ApiCategory | null>(null);
  const [rounds, setRounds] = useState<ApiRound[]>([]);
  const [rankings, setRankings] = useState<RankingWithTeam[]>([]);
  const [rules, setRules] = useState<AdvancementRuleData[]>([]);

  const [currentUserId, setCurrentUserId] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addErrorMessage, setAddErrorMessage] = useState('');
  const [addSuccessMessage, setAddSuccessMessage] = useState('');

  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [createTeamError, setCreateTeamError] = useState('');
  const [createTeamSuccess, setCreateTeamSuccess] = useState('');

  const [allCategories, setAllCategories] = useState<ApiCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [registeringCat, setRegisteringCat] = useState(false);
  const [registerCatError, setRegisterCatError] = useState('');
  const [registerCatSuccess, setRegisterCatSuccess] = useState('');

  const [allEvents, setAllEvents] = useState<ApiEvent[]>([]);
  const [tempCategoryName, setTempCategoryName] = useState('');

  const [oldTeams, setOldTeams] = useState<OldTeamData[]>([]);

  // Tất cả team mà user tham gia (dùng cho dropdown event)
  const [myAllTeams, setMyAllTeams] = useState<MyTeamEntry[]>([]);
  // Ref để loadData đọc requestedEventId mà không cần đưa vào deps
  const requestedEventIdRef = useRef(requestedEventId);

  // Cập nhật ref khi URL thay đổi
  useEffect(() => {
    requestedEventIdRef.current = requestedEventId;
  }, [requestedEventId]);

  // Các event option cho dropdown - gom tất cả event từ myAllTeams
  const eventOptions = useMemo(() => {
    return myAllTeams
      .filter((entry) => entry.event && !entry.isPending)
      .map((entry) => entry.event as ApiEvent)
      .filter((ev, idx, arr) => arr.findIndex((e) => e.EventID === ev.EventID) === idx)
      .sort((a, b) => a.EventName.localeCompare(b.EventName));
  }, [myAllTeams]);

  // Load dữ liệu - hỗ trợ eventId từ URL
  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const userId = getStoredUserId();
      setCurrentUserId(userId ?? '');
      const fetchedTeams = await getTeams();
      const [eventsData, categoriesData] = await Promise.all([getEvents(), getCategories()]);

      const allEntries: MyTeamEntry[] = [];
      const now = new Date();
      let selectedEntry: MyTeamEntry | undefined;

      for (const candidateTeam of fetchedTeams) {
        const candidateMembers = await getTeamMembers(candidateTeam.TeamID);
        const isMember = candidateMembers.some(
          (member) => userId && member.UserId.toLowerCase() === userId.toLowerCase()
        );
        const isLeader =
          userId && candidateTeam.TeamLeaderId.toLowerCase() === userId.toLowerCase();

        if (!isMember && !isLeader) continue;

        let teamEvent: ApiEvent | undefined;
        let teamCategory: ApiCategory | null = null;
        if (candidateTeam.CategoryID) {
          teamCategory = categoriesData.find((c) => c.CategoryID === candidateTeam.CategoryID) || null;
          if (teamCategory) {
            const ev = eventsData.find((e) => e.EventID === teamCategory!.EventID);
            if (ev) teamEvent = ev;
          }
        } else if (candidateTeam.EventID) {
          teamEvent = eventsData.find((e) => e.EventID === candidateTeam.EventID);
        }

        const teamEventEnded = teamEvent ? new Date(teamEvent.EndDate) < now : true;
        const isTeamPending = !candidateTeam.CategoryID;
        const entry: MyTeamEntry = {
          team: candidateTeam,
          members: candidateMembers,
          event: teamEvent || null,
          category: teamCategory,
          isLeader: Boolean(isLeader),
          isPending: isTeamPending,
        };

        allEntries.push(entry);

        // Chọn entry: ưu tiên theo eventId URL, rồi fallback theo logic cũ
        if (!selectedEntry) {
          const targetEventId = requestedEventIdRef.current;
          if (targetEventId) {
            const evId = teamEvent?.EventID || teamCategory?.EventID || '';
            if (evId.toLowerCase() === targetEventId.toLowerCase()) {
              selectedEntry = entry;
            }
          }
          if (!selectedEntry && (isLeader || isMember) && (isTeamPending || !teamEventEnded)) {
            selectedEntry = entry;
          }
        }
      }

      setMyAllTeams(allEntries);

      const myOldTeamsForCreate: OldTeamData[] = allEntries
        .filter((e) => e.isLeader)
        .map((e) => ({
          TeamID: e.team.TeamID,
          TeamName: e.team.TeamName,
          members: e.members,
        }));
      setOldTeams(myOldTeamsForCreate);

      if (!selectedEntry) {
        setTeam(null);
        setMembers([]);
        setEvent(null);
        setCategory(null);
        setRounds([]);
        setRankings([]);
        setRules([]);
        setAllCategories(categoriesData);
        setAllEvents(eventsData);
        setLoading(false);
        return;
      }

      setTeam(selectedEntry.team);
      setMembers(selectedEntry.members);
      setEvent(selectedEntry.event);
      setCategory(selectedEntry.category);
      setAllCategories(categoriesData);
      setAllEvents(eventsData);

      if (selectedEntry.event) {
        try {
          const roundsData = await getRounds(selectedEntry.event.EventID);
          const rulesData = await getAdvancementRules();
          const rankingRows: RankingWithTeam[] = [];
          for (const round of roundsData) {
            const roundRankings = await getRankings(round.RoundID);
            rankingRows.push(...roundRankings.filter((r) => r.TeamId === selectedEntry!.team.TeamID));
          }
          setRounds(roundsData);
          setRules(rulesData);
          setRankings(rankingRows);
        } catch {
          setRounds([]);
          setRules([]);
          setRankings([]);
        }
      } else {
        setRounds([]);
        setRules([]);
        setRankings([]);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Không thể tải dữ liệu thành viên từ API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Theo dõi URL: nếu user back/forward tới eventId khác, tự load lại đúng team
  useEffect(() => {
    if (!requestedEventId) return;
    const currentTeamEventId =
      event?.EventID ||
      category?.EventID ||
      '';
    if (currentTeamEventId.toLowerCase() === requestedEventId.toLowerCase()) return;
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedEventId]);

  // Xử lý khi user đổi event trong dropdown
  const handleEventChange = useCallback(
    (eventId: string) => {
      const entry = myAllTeams.find((e) => {
        const evId = e.event?.EventID || e.category?.EventID || '';
        return evId.toLowerCase() === eventId.toLowerCase();
      });
      if (!entry) return;

      if (entry.team.TeamID !== team?.TeamID) {
        // Chuyển sang team/event khác
        setTeam(entry.team);
        setMembers(entry.members);
        setEvent(entry.event);
        setCategory(entry.category);
        setRounds([]);
        setRankings([]);
        setRules([]);

        // Cập nhật URL để đồng bộ
        if (entry.event?.EventID && requestedEventId !== entry.event.EventID) {
          router.replace(`/member?eventId=${encodeURIComponent(entry.event.EventID)}`);
        } else if (!entry.event && requestedEventId) {
          router.replace('/member');
        }

        // Load rounds cho event mới
        if (entry.event) {
          void (async () => {
            try {
              const roundsData = await getRounds(entry.event!.EventID);
              const rulesData = await getAdvancementRules();
              const rankingRows: RankingWithTeam[] = [];
              for (const round of roundsData) {
                const roundRankings = await getRankings(round.RoundID);
                rankingRows.push(...roundRankings.filter((r) => r.TeamId === entry.team.TeamID));
              }
              setRounds(roundsData);
              setRules(rulesData);
              setRankings(rankingRows);
            } catch {
              setRounds([]);
              setRules([]);
              setRankings([]);
            }
          })();
        }
      }
    },
    [myAllTeams, team, router, requestedEventId]
  );

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setCreatingTeam(true);
    setCreateTeamError('');
    setCreateTeamSuccess('');

    try {
      if (newTeamName.trim().length < 2 || newTeamName.trim().length > 120) {
        throw new Error('Tên nhóm phải chứa từ 2 đến 120 ký tự.');
      }

      const newTeam = await createTeam(newTeamName.trim());
      if (!newTeam) {
        throw new Error('Không thể tạo nhóm mới.');
      }

      setCreateTeamSuccess('Đã thành lập đội thành công! Hãy thêm thành viên để đủ 3 người rồi đăng ký sự kiện.');
      setNewTeamName('');

      await loadData();
      router.push(requestedEventId ? `/member?eventId=${encodeURIComponent(requestedEventId)}` : '/member');
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message || (err instanceof Error ? err.message : '') || 'Không thể tạo nhóm mới.';
      setCreateTeamError(msg);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleRegisterCategorySubmit = async (categoryId: string, eventId: string) => {
    if (!eventId || !team) return;

    setRegisteringCat(true);
    setRegisterCatError('');
    setRegisterCatSuccess('');

    try {
      const catId = categoryId || allCategories.find((c) => c.EventID === eventId)?.CategoryID || null;
      await setTeamCategory(team.TeamID, catId, eventId);
      setRegisterCatSuccess('Đăng ký tham gia sự kiện và hạng mục thành công!');
      showToast('Đăng ký tham gia sự kiện thành công!', 'success');
      router.push('/my-events');
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message || (err instanceof Error ? err.message : '') || 'Không thể đăng ký hạng mục.';
      setRegisterCatError(msg);
    } finally {
      setRegisteringCat(false);
    }
  };

  const isLeader = team && currentUserId && team.TeamLeaderId.toLowerCase() === currentUserId.toLowerCase();

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberId.trim() || !team) return;

    setAddingMember(true);
    setAddErrorMessage('');
    setAddSuccessMessage('');

    try {
      if (!validateMemberLookup(newMemberId)) {
        throw new Error('Vui lòng nhập GUID, email, mã thành viên hoặc mã sinh viên hợp lệ.');
      }

      await addTeamMember(team.TeamID, newMemberId.trim());
      setAddSuccessMessage('Đã thêm thành viên mới thành công!');
      setNewMemberId('');

      const updatedMembers = await getTeamMembers(team.TeamID);
      setMembers(updatedMembers);

      if (requestedEventId && updatedMembers.length >= 3) {
        const catId = allCategories.find((c) => c.EventID === requestedEventId)?.CategoryID || null;
        await setTeamCategory(team.TeamID, catId, requestedEventId);
        showToast('Đội đã đủ 3 người & Đăng ký sự kiện thành công!', 'success');
        router.push('/my-events');
      }
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message || (err instanceof Error ? err.message : '') || 'Không thể thêm thành viên.';
      setAddErrorMessage(msg);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId: string, teamMemberId: string) => {
    try {
      await removeTeamMember(teamId, teamMemberId);
      setOldTeams((prev) =>
        prev.map((t) =>
          t.TeamID === teamId
            ? { ...t, members: t.members.filter((m) => m.TeamMemberId !== teamMemberId) }
            : t
        )
      );
      if (team && team.TeamID === teamId) {
        setMembers((prev) => prev.filter((m) => m.TeamMemberId !== teamMemberId));
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || (err instanceof Error ? err.message : '') || 'Không thể xóa thành viên.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Cổng Thành Viên Đội</h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Tra cứu thông tin đội, hồ sơ sinh viên và kết quả thăng hạng qua các vòng thi.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/my-events"
            className="inline-flex h-9 items-center rounded-xl border border-slate-200 px-3 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
          >
            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
            Xem sự kiện của tôi
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-xl border-slate-200 text-xs font-semibold"
            onClick={() => void loadData()}
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại dữ liệu
          </Button>
        </div>
      </div>

      {/* Dropdown chọn sự kiện - chỉ hiện khi có nhiều hơn 1 event */}
      {eventOptions.length > 0 && (
        <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/10">
          <CardContent className="flex items-center gap-4 p-4">
            <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Sự kiện:
            </span>
            <select
              value={event?.EventID || ''}
              onChange={(e) => void handleEventChange(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-indigo-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-indigo-800 dark:bg-slate-900 dark:text-slate-100"
            >
              {eventOptions.map((ev) => (
                <option key={ev.EventID} value={ev.EventID}>
                  {ev.EventName}
                </option>
              ))}
            </select>
            {team && (
              <div className="shrink-0 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
                {team.TeamName}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-44 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-56 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {errorMessage && (
              <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            {!team || forceNewTeam ? (
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
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6 pt-0">
                  <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                    Bạn chưa thuộc về đội nào. Nhập tên nhóm bên dưới để thành lập nhóm mới.
                  </div>
                  <CreateTeamCard
                    newTeamName={newTeamName}
                    setNewTeamName={setNewTeamName}
                    creatingTeam={creatingTeam}
                    createTeamError={createTeamError}
                    createTeamSuccess={createTeamSuccess}
                    onSubmit={handleCreateTeamSubmit}
                    oldTeams={oldTeams}
                    currentUserId={currentUserId}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {requestedEventId && (!team.CategoryID || (event && new Date(event.EndDate) < new Date())) && (
                  <Card className="border-indigo-100 bg-indigo-50/40 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/10">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      {members.length < 3 ? (
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Vui lòng thêm thành viên ở bảng bên phải để nhóm có ít nhất 3 người (Hiện tại: {members.length}/3 thành viên).
                        </p>
                      ) : (
                        <>
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                              Đội của bạn đã đủ {members.length} thành viên! Đã đủ điều kiện tham gia sự kiện.
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Bấm nút bên cạnh để hoàn tất đăng ký ngay cho đội {team.TeamName}.
                            </p>
                          </div>
                          <Button
                            type="button"
                            disabled={registeringCat}
                            onClick={() => void handleRegisterCategorySubmit('', requestedEventId)}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-700"
                          >
                            {registeringCat ? 'Đang đăng ký...' : 'Hoàn tất đăng ký sự kiện ngay'}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
                <TeamProfileCard
                  team={team}
                  category={category}
                  event={event}
                  members={members}
                  allCategories={allCategories}
                  allEvents={allEvents}
                  preferredEventId={requestedEventId}
                  allowEventRegistration={true}
                  isLeader={isLeader || false}
                  tempCategoryName={tempCategoryName}
                  setTempCategoryName={setTempCategoryName}
                  registeringCat={registeringCat}
                  selectedCategoryId={selectedCategoryId}
                  setSelectedCategoryId={setSelectedCategoryId}
                  registerCatSuccess={registerCatSuccess}
                  registerCatError={registerCatError}
                  onRegisterCategory={handleRegisterCategorySubmit}
                />
                <TeamRoundsCard
                  team={team}
                  category={category}
                  rounds={rounds}
                  rankings={rankings}
                  rules={rules}
                />
              </>
            )}
          </div>

          <div className="space-y-6 lg:col-span-1">
            {forceNewTeam ? (
              <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-indigo-900 dark:text-indigo-200">
                    <Bookmark className="h-5 w-5 text-indigo-600 dark:text-indigo-400" /> Thành viên nhóm mới
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <p>
                    Vui lòng nhập tên nhóm và bấm <strong className="text-indigo-600 dark:text-indigo-400">&quot;Tạo nhóm mới&quot;</strong> ở khung bên trái.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sau khi nhóm mới được khởi tạo, bạn sẽ bắt đầu thêm các thành viên cho nhóm mới tại đây.
                  </p>
                </CardContent>
              </Card>
            ) : (
              team && (
                <TeamMembersCard
                  team={team}
                  members={members}
                  isLeader={isLeader || false}
                  newMemberId={newMemberId}
                  setNewMemberId={setNewMemberId}
                  addingMember={addingMember}
                  addErrorMessage={addErrorMessage}
                  addSuccessMessage={addSuccessMessage}
                  onSubmit={handleAddMemberSubmit}
                  onRemoveMember={async (teamMemberId) => {
                    await handleRemoveMember(team.TeamID, teamMemberId);
                  }}
                />
              )
            )}

            <Card className="border-none bg-slate-900/5 dark:bg-slate-900">
              <CardContent className="space-y-3 p-6">
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Quy định thăng hạng vòng thi
                </h4>
                <p className="text-xs leading-normal text-slate-500 dark:text-slate-400">
                  Chỉ các đội nằm trong Top N của hạng mục đăng ký mới có quyền thăng hạng và mở cổng nộp bài cho vòng
                  tiếp theo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
