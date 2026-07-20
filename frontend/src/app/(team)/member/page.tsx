'use client';

import React, { useEffect, useState } from 'react';
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
  Category as ApiCategory,
  Event as ApiEvent,
  Round as ApiRound,
  Team,
} from '@/lib/api';

import { CreateTeamCard } from '@/components/team/CreateTeamCard';
import { TeamProfileCard } from '@/components/team/TeamProfileCard';
import { TeamRoundsCard } from '@/components/team/TeamRoundsCard';
import { TeamMembersCard } from '@/components/team/TeamMembersCard';

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

export default function MemberPage() {
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
  const [firstMemberId, setFirstMemberId] = useState('');
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

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const userId = getStoredUserId();
      setCurrentUserId(userId ?? '');
      const fetchedTeams = await getTeams();
      const [eventsData, categoriesData] = await Promise.all([getEvents(), getCategories()]);

      let myTeam: Team | undefined;
      let myMembers: TeamMemberWithProfile[] = [];

      for (const candidateTeam of fetchedTeams) {
        if (userId && candidateTeam.TeamLeaderId.toLowerCase() === userId.toLowerCase()) {
          myTeam = candidateTeam;
          myMembers = await getTeamMembers(candidateTeam.TeamID);
          break;
        }

        const candidateMembers = await getTeamMembers(candidateTeam.TeamID);
        if (
          userId &&
          candidateMembers.some((member) => member.UserId.toLowerCase() === userId.toLowerCase())
        ) {
          myTeam = candidateTeam;
          myMembers = candidateMembers;
          break;
        }
      }

      setTeam(myTeam || null);
      setMembers(myMembers);
      setEvent(null);
      setCategory(null);
      setRounds([]);
      setRankings([]);
      setRules([]);
      setAllCategories(categoriesData);
      setAllEvents(eventsData);

      if (!myTeam) {
        return;
      }

      const myCategory = categoriesData.find((item) => item.CategoryID === myTeam.CategoryID);
      const myEvent = myCategory ? eventsData.find((item) => item.EventID === myCategory.EventID) : null;
      const roundsData = myEvent ? await getRounds(myEvent.EventID) : [];
      const rulesData = await getAdvancementRules();

      const rankingRows: RankingWithTeam[] = [];
      for (const round of roundsData) {
        const roundRankings = await getRankings(round.RoundID);
        rankingRows.push(...roundRankings.filter((ranking) => ranking.TeamId === myTeam.TeamID));
      }

      setCategory(myCategory || null);
      setEvent(myEvent || null);
      setRounds(roundsData);
      setRules(rulesData);
      setRankings(rankingRows);
    } catch (error) {
      console.error(error);
      setErrorMessage('Không thể tải dữ liệu thành viên từ API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, []);

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !firstMemberId.trim()) return;

    setCreatingTeam(true);
    setCreateTeamError('');
    setCreateTeamSuccess('');

    try {
      if (newTeamName.trim().length < 2 || newTeamName.trim().length > 120) {
        throw new Error('Tên nhóm phải chứa từ 2 đến 120 ký tự.');
      }

      if (!validateMemberLookup(firstMemberId)) {
        throw new Error('Vui lòng nhập GUID, email, mã thành viên hoặc mã sinh viên hợp lệ.');
      }

      const newTeam = await createTeam(newTeamName.trim());
      if (!newTeam) {
        throw new Error('Không thể tạo nhóm mới.');
      }

      try {
        await addTeamMember(newTeam.TeamID, firstMemberId.trim());
        setCreateTeamSuccess('Đã thành lập đội và thêm thành viên thành công!');
        setNewTeamName('');
        setFirstMemberId('');
      } catch (memberErr: unknown) {
        const axiosError = memberErr as { response?: { data?: { message?: string } } };
        const msg = axiosError.response?.data?.message || (memberErr instanceof Error ? memberErr.message : '');
        throw new Error(`Đội đã được tạo nhưng không thể thêm thành viên: ${msg}`);
      }

      await loadData();
      router.push(requestedEventId ? `/my-events?eventId=${encodeURIComponent(requestedEventId)}` : '/my-events');
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
    if (!categoryId || !eventId || !team) return;

    setRegisteringCat(true);
    setRegisterCatError('');
    setRegisterCatSuccess('');

    try {
      await setTeamCategory(team.TeamID, categoryId, eventId);
      setRegisterCatSuccess('Đăng ký tham gia sự kiện và hạng mục thành công!');
      await loadData();
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
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      const msg = axiosError.response?.data?.message || (err instanceof Error ? err.message : '') || 'Không thể thêm thành viên.';
      setAddErrorMessage(msg);
    } finally {
      setAddingMember(false);
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
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại dữ liệu
          </Button>
        </div>
      </div>

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
                    Bạn chưa thuộc về đội nào. Nhập tên nhóm và mã User ID thành viên muốn thêm bên dưới để tạo nhóm.
                  </div>
                  <CreateTeamCard
                    newTeamName={newTeamName}
                    setNewTeamName={setNewTeamName}
                    firstMemberId={firstMemberId}
                    setFirstMemberId={setFirstMemberId}
                    creatingTeam={creatingTeam}
                    createTeamError={createTeamError}
                    createTeamSuccess={createTeamSuccess}
                    onSubmit={handleCreateTeamSubmit}
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                {requestedEventId && !team.CategoryID && (
                  <Card className="border-indigo-100 bg-indigo-50/40 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/10">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        Hoàn tất danh sách thành viên của đội, sau đó đăng ký sự kiện tại trang Sự kiện của tôi.
                      </p>
                      <Link
                        href={`/my-events?eventId=${encodeURIComponent(requestedEventId)}`}
                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-700"
                      >
                        Tiếp tục đăng ký
                      </Link>
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
                  allowEventRegistration={false}
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
            {team && (
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
              />
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
